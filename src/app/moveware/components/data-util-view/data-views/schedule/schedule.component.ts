import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CollectionsService } from 'src/app/moveware/services';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UserService } from 'src/app/moveware/services/user-service';
import Utils from 'src/app/moveware/services/utils';
import { DataViewMetaData } from 'src/app/moveware/models';
import {
    EventSettingsModel,
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    YearService,
    TimelineViewsService,
    TimelineMonthService,
    TimelineYearService,
    AgendaService,
    MonthAgendaService,
    DragAndDropService,
    ResizeService,
    ExcelExportService,
    ICalendarExportService,
    ICalendarImportService,
    View,
    GroupModel,
    ScheduleComponent as Schedule,
    TimeScaleModel,
    WorkHoursModel
} from '@syncfusion/ej2-angular-schedule';
import { CacheService } from '../../../../services/cache.service';

/**
 * <p> Schedule view for grid-container to replace calendar </p>
 */

@Component({
    selector: 'schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss'],
    providers: [
        DayService,
        WeekService,
        WorkWeekService,
        MonthService,
        YearService,
        TimelineViewsService,
        TimelineMonthService,
        TimelineYearService,
        AgendaService,
        MonthAgendaService,
        DragAndDropService,
        ResizeService,
        ExcelExportService,
        ICalendarExportService,
        ICalendarImportService
    ]
})
export class ScheduleComponent implements OnInit {
    @Input() viewMode: string;
    @Input() selectedRecord: Object;

    @Input() currentPage: Object;
    @Input() currentView: Object;
    dataSource: Array<Object>;
    columns: Array<Object>;
    metaData: DataViewMetaData;
    @Output() onRecordSelection = new EventEmitter<any>();
    public views: View[] = [
        'Day',
        'WorkWeek',
        'Week',
        'Month',
        'Year',
        'Agenda',
        'MonthAgenda',
        'TimelineDay',
        'TimelineWorkWeek',
        'TimelineWeek',
        'TimelineMonth',
        'TimelineYear'
    ];
    public selectedView: string = 'Week';
    public previousState: string;
    public currentRecord = null;
    public selectedDate: Date = new Date();
    public formAction: Boolean = false;
    public timeScale: TimeScaleModel;
    public workHours: WorkHoursModel;
    public startTime: any;
    public resetView: Boolean = true;
    public rowHeight: Number;

    @ViewChild('schedule') schedule: Schedule;
    timeZone: any;

    /**
     * <p>Constructor</p>
     * @param broadcaster is broadcaster for event listeners
     * @param gridService is grid service
     * @param toastService is toast message service
     * @param collectionService is collection service for API calls
     * @param userService is user service for user information
     */
    constructor(
        private broadcaster: Broadcaster,
        public gridService: GridService,
        private toastService: ToastService,
        private collectionService: CollectionsService,
        private userService: UserService,
        private cacheService: CacheService
    ) {}

    // variables below are to be replaced with dynamic metadata
    public eventSettings: EventSettingsModel = {
        fields: {
            id: '_id',
            subject: { name: 'FileDescription' },
            description: { name: 'FileDetails' },
            location: { name: 'FileLocation' },
            startTime: { name: 'DateFrom' },
            endTime: { name: 'DateTo' },
            isAllDay: { name: 'IsAllDay' }
        }
    };
    public group: GroupModel = {
        byDate: true,
        resources: ['Assignees']
    };
    public allowMultipleAssignees: Boolean = true;
    public assigneeDataSource: Object[] = [
        { text: 'V100 - Rigid', assigneeId: 1, color: '#1aaa55' },
        { text: 'V200 - Packing Van', assigneeId: 2, color: '#7fa900' },
        { text: 'V300 - Car', assigneeId: 2, color: '#7fa900' },
        { text: 'V400 - Semi Trailer', assigneeId: 2, color: '#7fa900' }
    ];

    /**
     * <p>ngOnInit lifecycle method</p>
     */
    ngOnInit() {
        let timeZoneData = this.cacheService.getSessionData('TimeZone');
        let timeZoneCode = timeZoneData ? JSON.parse(timeZoneData) : undefined;
        this.timeZone =
            timeZoneCode && timeZoneCode['CodeValue']
                ? timeZoneCode['CodeValue']
                : Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    /**
     * <p>Data Binding event; triggers just before the data binds to the scheduler</p>
     * @param $event : data binding event from the schedule component
     */
    getData($event) {
        this.schedule.eventSettings.dataSource = this.dataSource;

        if (!this.currentRecord) {
            setTimeout(() => {
                this.selectFirstEvent();
            }, 500);
        }

        if (this.resetView) {
            this.schedule.scrollTo(this.startTime);
        }

        this.resetView = true;
    }

    /**
     * <p>Event click event from schedule component; triggers on single-clicking the schedule event</p>
     * @param $event : mouse click event
     */
    onClick($event) {
        this.currentRecord = this.schedule.getEventDetails($event.element);
        this.selectedRecord = $event.event;
        this.selectEvent($event.event);
    }

    /**
     * <p>Refresh View</p>
     */
    refreshView() {
        this.setView(this.metaData.layout);
        this.setTimeScale(this.metaData);
        this.workHours = this.setWorkHours(this.metaData);
    }

    /**
     * <p>Set form to selected data</p>
     * @param data : data to be displayed on form
     */
    selectEvent(data) {
        if (data) {
            let taskData = {
                eventType: 'DISPLAY_CHILDREN',
                data: data,
                parent: this.currentPage['CodeElement'],
                mode: StandardCodes.VIEW_UPDATE_MODE
            };
            this.onRecordSelection.emit(taskData);
            this.currentRecord = Utils.getCopy(data);
        }
    }

    /**
     * <p>Sets the default view of the schedule</p>
     * @param viewSettings : viewSettings
     */
    setView(viewSettings) {
        let view: any = 'Week';

        if (typeof viewSettings === 'object') {
            view = viewSettings.CodeCode.replace(' ', '') || 'Week';
        } else {
            view = viewSettings.replace(' ', '') || 'Week';
        }

        this.selectedView = view;
    }

    /**
     * <p>Gets the current view of the schedule</p>
     */
    getView() {
        return this.selectedView;
    }

    /**
     * <p> Set the Timezone of the Schedule </p>
     *
     * @param selectedTimeZoneView : selected Time Zone View
     */
    setTimeZone(selectedTimeZoneView) {
        this.timeZone = selectedTimeZoneView.CodeCode
            ? selectedTimeZoneView.CodeCode
            : Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (this.schedule) {
            this.schedule.timezone = this.timeZone;
        }
    }

    /**
     * <p> Gets the Timezone of the Schedule </p>
     */
    getTimeZone() {
        if (this.schedule) {
            return this.schedule.timezone;
        } else {
            return this.timeZone;
        }
    }

    /**
     * <p>Sets the default timeScale setting of the schedule</p>
     * @param timeSettings : timeScale settings from grid metadata
     */
    setTimeScale(timeSettings) {
        let timeScale: any = {
            enable: true,
            interval: 60,
            slotCount: 2
        };

        if (timeSettings.layoutSize) {
            switch (timeSettings.layoutSize) {
                case 'Large':
                    timeScale.slotCount = 4;
                    break;
                case 'Medium':
                    timeScale.slotCount = 3;
                    break;
                case 'Small':
                    timeScale.slotCount = 2;
                    break;
                case 'Very Small':
                    timeScale.slotCount = 1;
                    break;
                default:
                    timeScale.slotCount = 3;
                    break;
            }
        }

        this.timeScale = timeScale;

        this.setTimeInterval(timeSettings.timeInterval);
    }

    /**
     * <p> Gets the TimeScale of the Schedule </p>
     */
    getTimeScale(type) {
        let value = this.timeScale[type];

        if (type === 'slotCount') {
            switch (value) {
                case 4:
                    return 'Large';
                case 3:
                    return 'Medium';
                case 2:
                    return 'Small';
                case 1:
                    return 'Very Small';
                default:
                    return 'Medium';
            }
        } else {
            return value;
        }
    }

    /**
     * <p> Sets the Time Interval </p>
     *
     * @param : time interval parameter
     */

    setTimeInterval(timeSettings) {
        let interval: number = 60;
        let timeInterval;

        if (timeSettings.timeInterval) {
            timeInterval = timeSettings.timeInterval;
        } else if (timeSettings.CodeCode) {
            timeInterval = timeSettings.CodeCode;
        }

        if (timeInterval) {
            let temp = parseInt(timeInterval.substring(0, timeInterval.indexOf(' ')));
            if (timeInterval.includes('hour')) {
                interval = temp * 60;
            } else {
                interval = temp;
            }
        }

        if (this.schedule) {
            this.schedule.timeScale.interval = interval;
        }
        this.timeScale.interval = interval;
    }

    /**
     * <p> Gets the Time Interval of the Scheduler </p>
     */
    getTimeInterval() {
        let timeInterval = this.getTimeScale('interval');

        return timeInterval + ' minutes';
    }

    /**
     * <p>Sets the default work hours of the schedule</p>
     * @param hourSettings : workHours settings from grid metadata
     */
    setWorkHours(hourSettings) {
        let workHours = {
            start: '08:00',
            end: '20:00'
        };

        if (hourSettings) {
            if (hourSettings.timeFrom) {
                let newDate = new Date(Date.parse(hourSettings.timeFrom));
                workHours.start = newDate.toLocaleTimeString().substr(0, 5);
                this.startTime = workHours.start;
            }
        }

        return workHours;
    }

    /**
     * <p> Set the slotCount of the schedule grid </p>
     */
    set setRowHeight(val) {
        if (this.schedule) {
            switch (val) {
                case 35: {
                    this.schedule.timeScale.slotCount = 4;
                    this.timeScale.slotCount = 4;
                    break;
                }
                case 30: {
                    this.schedule.timeScale.slotCount = 3;
                    this.timeScale.slotCount = 3;
                    break;
                }
                case 25: {
                    this.schedule.timeScale.slotCount = 2;
                    this.timeScale.slotCount = 2;
                    break;
                }
                case 20: {
                    this.schedule.timeScale.slotCount = 1;
                    this.timeScale.slotCount = 1;
                    break;
                }
                default: {
                    this.schedule.timeScale.slotCount = 3;
                    this.timeScale.slotCount = 3;
                    break;
                }
            }
        }
    }

    /**
     * <p>Drag or Resize start event from schedule component; triggers when the event drag actions starts</p>
     * @param $event : schedule drag/resize event
     */
    editStart($event) {
        this.previousState = $event.data;
    }

    /**
     * <p>Drag or Resize stop event from schedule component; triggers when the event drag actions stops</p>
     * @param $event : schedule drag/resize event.
     */
    editStop($event) {
        if (!Utils.isObjectsEqual(this.previousState, $event.data)) {
            this.updateEvent($event.data);
        }
    }

    /**
     * <p>Action Complete event from schedule component; triggers when an action is completed</p>
     * @param $event : schedule action complete event
     */
    actionComplete($event) {
        if (!this.formAction && $event && $event.requestType === 'eventCreated') {
            this.createEvent($event.data[0]);
            this.resetView = false;
        } else if (!this.formAction && $event && $event.requestType === 'eventRemoved') {
            this.deleteEvent($event.data[0]);
        } else if (!this.formAction && $event && $event.requestType === 'eventChanged') {
            this.updateEvent($event.data[0]);
        } else if ($event.name === 'cellClick') {
            $event.cancel = true;
        } else if ($event.requestType === 'toolBarItemRendered') {
            this.refreshView();
        }
        this.formAction = false;
    }

    /**
     * <p>Registering creation of an event via the data form</p>
     * @param record : the record that has been added via the data form
     */
    add(record) {
        if (this.schedule) {
            this.formAction = true;
            this.schedule.addEvent(record);
        }
    }

    /**
     * <p>Registering deletion of an event via the data form</p>
     * @param record : the record that has been deleted via the data form
     */
    delete(record) {
        if (this.schedule) {
            this.formAction = true;
            this.schedule.deleteEvent(record);
            setTimeout(() => {
                this.selectFirstEvent();
            }, 500);
        }
    }

    /**
     * <p>Registering update of an event via the data form</p>
     * @param record : the record that has been updated via the data form
     */
    updateRecord(record) {
        if (this.schedule) {
            this.formAction = true;
            this.schedule.saveEvent(record);
        }
    }

    /**
     * <p> Creates a record from the event that is created in the scheduler component</p>
     * @param data : This is the event data that is created in the scheduler
     */
    createEvent(data) {
        if (data) {
            let eventId = data['_id'];
            let appointmentObj: Object = {
                _id: StandardCodesIds.FILE_TYPE_APPOINTMENT_ID,
                CodeCode: 'Appointment',
                CodeDescription: 'Appointment',
                CodeIsActivity: true
            };
            data['_id'] = undefined;
            let reqObject = this.buildReqObject(data, 'create');
            if (!Utils.isObjectEmpty(reqObject)) {
                this.collectionService.addCollectionItem(reqObject).subscribe(
                    (response) => {
                        if (response.body) {
                            data['_id'] = JSON.parse(response.body).id || undefined;
                        }
                        data['FileType'] = appointmentObj;
                        if (data['_id'] === undefined) {
                            this.schedule.deleteEvent(eventId);
                            this.toastService.addErrorMessage(
                                data['FileDescription'] + ' add failed. '
                            );
                        } else {
                            // this.schedule.saveEvent(data);
                            this.toastService.addSuccessMessage(
                                data['FileDescription'] + ' added successfully. '
                            );
                            this.selectEvent(data);
                        }
                    },
                    (error) => {
                        this.toastService.showCustomToast('error', error);
                        this.schedule.deleteEvent(eventId);
                        if (this.schedule) {
                            this.schedule.refresh();
                        }
                    }
                );
            }
        }
    }

    /**
     * <p> Deletes a record from the event that is deleted in the scheduler component</p>
     * @param data : This is the event data that is deleted in the scheduler
     */
    deleteEvent(data) {
        if (data) {
            let reqObject = this.buildReqObject(data, 'delete');
            if (!Utils.isObjectEmpty(reqObject)) {
                this.collectionService.removeCollectionItem(reqObject).subscribe(
                    (response) => {
                        this.toastService.addSuccessMessage(
                            data['FileDescription'] + ' deleted successfully. '
                        );
                        setTimeout(() => {
                            this.selectFirstEvent();
                        }, 500);
                    },
                    (error) => {
                        this.toastService.showCustomToast('error', error);
                        if (this.schedule) {
                            this.schedule.refresh();
                        }
                    }
                );
            }
        }
    }

    /**
     * <p>Update record when dragging an event from one timeslot to another</p>
     * @param data : an object representing the record that has been updated from the scheduler
     */
    updateEvent(data: object) {
        let reqObject = this.buildReqObject(data);
        let ref = this;
        if (!Utils.isObjectEmpty(reqObject)) {
            this.collectionService.updateCollectionItem(reqObject).subscribe(
                (response) => {
                    this.selectEvent(data);
                    this.toastService.addSuccessMessage(
                        data['FileDescription'] + ' updated successfully. '
                    );
                },
                (error) => {
                    this.toastService.showCustomToast('error', error);
                    if (this.schedule) {
                        this.schedule.refresh();
                    }
                }
            );
        }
    }

    /**
     * <p> Builds the request Object to update an event</p>
     * @param data : The record data to be updated
     */
    private buildReqObject(data, type?) {
        let reqObject = {};
        if (data) {
            let userId = this.userService.getUserId();
            reqObject['meta'] = {
                viewId: this.currentView['_id'],
                userId: userId
            };
            reqObject['type'] = this.currentView['dataObjectCodeCode'];
            if (type && type === 'create') {
                reqObject['payload'] = {
                    DateFrom: data.DateFrom,
                    DateTo: data.DateTo,
                    FileDescription: data.FileDescription,
                    FileDetails: data.FileDetails,
                    FileType: StandardCodesIds.FILE_TYPE_APPOINTMENT_ID,
                    FileStatus: StandardCodesIds.ACTIVE_STATUS_ID,
                    FileSubType: StandardCodesIds.FILE_SUBTYPE_SITE_VISIT,
                    IsAllDay: data['IsAllDay'] || false
                };
                reqObject['userId'] = userId;
            } else if (type && type === 'delete') {
                reqObject['_id'] = data['_id'];
            } else {
                reqObject['payload'] = {
                    DateFrom: data.DateFrom,
                    DateTo: data.DateTo,
                    FileDescription: data.FileDescription,
                    FileDetails: data.FileDetails,
                    IsAllDay: data['IsAllDay'] || false
                };
                reqObject['_id'] = data['_id'];
            }
        }

        return reqObject;
    }

    /**
     * <p>Sets the first available event as the selected event</p>
     */
    private selectFirstEvent() {
        if (this.schedule) {
            let currentViewEvents = this.schedule.getCurrentViewEvents();

            if (currentViewEvents) {
                for (let i = 0; i < currentViewEvents.length; i++) {
                    if (this.schedule.element) {
                        let guid = (currentViewEvents[i] as any).Guid;
                        let selectingEvent = this.schedule.element.querySelector(
                            "[data-guid='" + guid + "']"
                        );
                        if (selectingEvent) {
                            // Remove the current selected appointment class
                            if (this.schedule.eventBase) {
                                this.schedule.eventBase.removeSelectedAppointmentClass();
                            }

                            let data = { element: selectingEvent, event: currentViewEvents[i] };

                            // Changing the Schedule activeEventData with the current selected event data
                            this.schedule.activeEventData = data as any;
                            this.onClick(data);

                            // Selecting the event by adding the e-appointment-border class
                            selectingEvent.classList.add('e-appointment-border');

                            break;
                        }
                    }
                }
            }
        }
    }
    set setViewMode(mode) {
        this.viewMode = mode;
        //view mode chagne goes here
    }
    set setSelectedColumns(columns) {
        this.columns = columns;
    }
    set setDataSource(data) {
        this.dataSource = data;
    }
    public destroy() {
        this.ngOnDestroy();
    }
    ngOnDestroy() {}
}
