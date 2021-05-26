import { Injectable } from '@angular/core';
import { BasePortalHost } from '@angular/cdk/portal';
import { endOfToday, startOfTomorrow, endOfTomorrow, startOfToday } from 'date-fns';

@Injectable()
export class DashboardService {
    constructor() {}
    getTopCustomers() {
        let revenue = [600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100];
        return {
            labels: [
                'Moveware Melbourne',
                'Moveware London',
                'BHP Melbourne',
                'Anglo Pacific',
                'Moveware Pty Ltd',
                'Moveware Toronto',
                'King & Wilson',
                'AXA Insurance',
                'Moveware Bangkok',
                'BHP Melbourne'
            ],
            datasets: [
                {
                    label: 'Top Customers',
                    data: revenue,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#76BA1B',
                        '#F39C12',
                        '#16A085',
                        '#E74C3C',
                        '#F1C40F',
                        '#FE4C26',
                        '#04E7B3'
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#76BA1B',
                        '#F39C12',
                        '#16A085',
                        '#E74C3C',
                        '#F1C40F',
                        '#FE4C26',
                        '#04E7B3'
                    ]
                }
            ]
        };
    }

    getAgedReceviables() {
        let data = [
            {
                EntityCustomer: 'BHP',
                EntityAgedReceviables: 23012
            },
            {
                EntityCustomer: 'ANZ Bank',
                EntityAgedReceviables: 18000
            },
            {
                EntityCustomer: 'Newcorp',
                EntityAgedReceviables: 15412
            },
            {
                EntityCustomer: 'NBA',
                EntityAgedReceviables: 13670
            },
            {
                EntityCustomer: 'ABP',
                EntityAgedReceviables: 12870
            },
            {
                EntityCustomer: 'LNA',
                EntityAgedReceviables: 10670
            },
            {
                EntityCustomer: 'PNA',
                EntityAgedReceviables: 11570
            },
            {
                EntityCustomer: 'YTA',
                EntityAgedReceviables: 13870
            },
            {
                EntityCustomer: 'NPM',
                EntityAgedReceviables: 15270
            },
            {
                EntityCustomer: 'ALN',
                EntityAgedReceviables: 10070
            }
        ];

        let header = [
            {
                CodeCode: 'EntityCustomer',
                CodeDescription: 'customer'
            },
            {
                CodeCode: 'EntityAgedReceviables',
                CodeDescription: 'revenue'
            }
        ];
        return {
            data: data,
            header: header
        };
    }

    getKeyEvents() {
        let data = [
            {
                EntityEmployee: 'Stefan Edberg',
                EntityBranch: 'MEL',
                EntityEvent: 'Birthday',
                EntityDate: 'Mon 12th Feb'
            },
            {
                EntityEmployee: 'Matts Wilander',
                EntityBranch: 'SYD',
                EntityEvent: 'Birthday',
                EntityDate: 'Thu 15th Feb'
            },
            {
                EntityEmployee: 'Yaachim Nystrom',
                EntityBranch: 'MEL',
                EntityEvent: 'Sick Leave',
                EntityDate: 'Today'
            },
            {
                EntityEmployee: 'Bjorn Borg',
                EntityBranch: 'SYD',
                EntityEvent: 'Maintenance',
                EntityDate: 'Today'
            },
            {
                EntityEmployee: 'Patrick McEnroe',
                EntityBranch: 'MEL',
                EntityEvent: 'Revenue Planning',
                EntityDate: 'Today'
            },
            {
                EntityEmployee: 'Yaachim Edberg',
                EntityBranch: 'MEL',
                EntityEvent: 'Anniversary',
                EntityDate: 'Today'
            },
            {
                EntityEmployee: 'John McEnroe',
                EntityBranch: 'SYD',
                EntityEvent: 'Planned Leave',
                EntityDate: 'Today'
            }
        ];

        let header = [
            {
                CodeCode: 'EntityEmployee',
                CodeDescription: 'employee'
            },
            {
                CodeCode: 'EntityBranch',
                CodeDescription: 'branch'
            },
            {
                CodeCode: 'EntityEvent',
                CodeDescription: 'event'
            },
            {
                CodeCode: 'EntityDate',
                CodeDescription: 'date'
            }
        ];
        return {
            data: data,
            header: header
        };
    }

    getTodaysTasks() {
        let data = [
            {
                EntityTask: '100034',
                EntityPerson: 'Bjorn Borg',
                EntityToDo: 'Email Client about Insurance'
            },
            {
                EntityTask: '100030',
                EntityPerson: 'John McEnroe',
                EntityToDo: 'Invoice Client'
            },
            {
                EntityTask: '100031',
                EntityPerson: 'Patrick McEnroe',
                EntityToDo: 'Chase Origin Rate Request'
            },
            {
                EntityTask: '100032',
                EntityPerson: 'Stefan Edberg',
                EntityToDo: 'Meeting about Insurance'
            },
            {
                EntityTask: '100035',
                EntityPerson: 'Matts Wilander',
                EntityToDo: 'Share Customer Details'
            },
            {
                EntityTask: '100036',
                EntityPerson: 'Yaachim Nystrom',
                EntityToDo: 'Have a conference call'
            }
        ];

        let header = [
            {
                CodeCode: 'EntityTask',
                CodeDescription: 'Reference'
            },
            {
                CodeCode: 'EntityPerson',
                CodeDescription: 'name'
            },
            {
                CodeCode: 'EntityToDo',
                CodeDescription: 'todo'
            }
        ];
        return {
            data: data,
            header: header
        };
    }

    getGroups() {
        let data = [
            {
                EntityGroup: 'Employees',
                EntityJoined: '12/03/18',
                EntityStatus: 'Active'
            },
            {
                EntityGroup: 'Managers',
                EntityJoined: '20/03/18',
                EntityStatus: 'Active'
            },
            {
                EntityGroup: 'Supervisors',
                EntityJoined: '12/03/18',
                EntityStatus: 'Inactive'
            },
            {
                EntityGroup: 'System Adminstrators',
                EntityJoined: '12/03/18',
                EntityStatus: 'Active'
            },
            {
                EntityGroup: 'Users',
                EntityJoined: '12/03/18',
                EntityStatus: 'Active'
            }
        ];

        let header = [
            {
                CodeCode: 'EntityGroup',
                CodeDescription: 'Group'
            },
            {
                CodeCode: 'EntityJoined',
                CodeDescription: 'Joined'
            },
            {
                CodeCode: 'EntityStatus',
                CodeDescription: 'Status'
            }
        ];
        return {
            data: data,
            header: header
        };
    }

    getRoles() {
        let data = [
            {
                EntityRole: 'Biller',
                EntityAssignee: 'BHP',
                EntityTelephone: '',
                EntityEmail: ''
            },
            {
                EntityRole: 'Booker',
                EntityAssignee: 'Cartus Corp',
                EntityTelephone: '',
                EntityEmail: ''
            },
            {
                EntityRole: 'Corporate',
                EntityAssignee: 'Mr Terry King',
                EntityTelephone: '0388176149',
                EntityEmail: 'terry@bhp.com.au'
            },
            {
                EntityRole: 'Surveyou',
                EntityAssignee: 'John Smith',
                EntityTelephone: '',
                EntityEmail: ''
            },
            {
                EntityRole: 'Move Manager',
                EntityAssignee: 'Jenny Wong',
                EntityTelephone: '',
                EntityEmail: ''
            },
            {
                EntityRole: 'Driver',
                EntityAssignee: 'Paul Jones',
                EntityTelephone: '',
                EntityEmail: ''
            },
            {
                EntityRole: 'Packer',
                EntityAssignee: 'Tom Reynolds',
                EntityTelephone: '',
                EntityEmail: ''
            }
        ];

        let header = [
            {
                CodeCode: 'EntityRole',
                CodeDescription: 'Role'
            },
            {
                CodeCode: 'EntityAssignee',
                CodeDescription: 'Assignee'
            },
            {
                CodeCode: 'EntityTelephone',
                CodeDescription: 'Telephone'
            },
            {
                CodeCode: 'EntityEmail',
                CodeDescription: 'Email'
            }
        ];
        return {
            data: data,
            header: header
        };
    }

    getPriorityClients() {
        let data = [
            {
                EntityEmployee: 'Stefan Edberg',
                EntityBranch: 'MEL',
                EntityDetails: 'Geelong to Howthorn'
            },
            {
                EntityEmployee: 'Matts Wilander',
                EntityBranch: 'SYD',
                EntityDetails: 'Sydney to London'
            },
            {
                EntityEmployee: 'Yaachim Nystrom',
                EntityBranch: 'MEL',
                EntityDetails: 'Wagga Wagga to Brisbane'
            },
            {
                EntityEmployee: 'John McEnroe',
                EntityBranch: 'SYD',
                EntityDetails: 'Wagga Wagga to Brisbane'
            },
            {
                EntityEmployee: 'Bjorn Borg',
                EntityBranch: 'MEL',
                EntityDetails: 'Sydney to Brisbane'
            },
            {
                EntityEmployee: 'Yaachim Borg',
                EntityBranch: 'MEL',
                EntityDetails: 'Geelong to London'
            },
            {
                EntityEmployee: 'John Nystrom',
                EntityBranch: 'MEL',
                EntityDetails: 'London to Geelong'
            }
        ];

        let header = [
            {
                CodeCode: 'EntityEmployee',
                CodeDescription: 'employee'
            },
            {
                CodeCode: 'EntityBranch',
                CodeDescription: 'branch'
            },
            {
                CodeCode: 'EntityDetails',
                CodeDescription: 'details'
            }
        ];
        return {
            data: data,
            header: header
        };
    }

    getHoursWorked() {
        return {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: '2018',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#4bc0c0'
                },
                {
                    label: '2019',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    borderColor: '#565656'
                }
            ]
        };
    }

    getRevenueYtd() {
        return {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: '2018',
                    data: [55, 89, 50, 81, 52, 65, 40],
                    fill: false,
                    borderColor: '#4bc0c0'
                },
                {
                    label: '2019',
                    data: [38, 58, 30, 29, 76, 37, 80],
                    fill: false,
                    borderColor: '#565656'
                }
            ]
        };
    }

    getVolumeByMonth() {
        return {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: '2018',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#4bc0c0'
                },
                {
                    label: '2019',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    borderColor: '#565656'
                }
            ]
        };
    }

    getPrivateReviews() {
        return {
            labels: ['Positive', 'Negative'],
            datasets: [
                {
                    data: [90, 10],
                    backgroundColor: ['#36A2EB', '#ff6384b5'],
                    hoverBackgroundColor: ['#36A2EB', '#FF6384']
                }
            ]
        };
    }
    getCorporateReviews() {
        return {
            labels: ['Positive', 'Negative'],
            datasets: [
                {
                    data: [85, 15],
                    backgroundColor: ['#36A2EB', '#ff6384b5'],
                    hoverBackgroundColor: ['#36A2EB', '#FF6384']
                }
            ]
        };
    }
    getPatnerReviews() {
        return {
            labels: ['Positive', 'Negative'],
            datasets: [
                {
                    data: [95, 5],
                    backgroundColor: ['#36A2EB', '#ff6384b5'],
                    hoverBackgroundColor: ['#36A2EB', '#FF6384']
                }
            ]
        };
    }

    getContacts() {
        return [
            {
                name: 'Stefan Ebderg',
                image: 'assets/images/profile2.jpg',
                designation: 'Manager',
                status: 'online'
            },
            {
                name: 'Kate Wilander',
                image: 'assets/images/profile1.jpg',
                designation: 'Manager',
                status: 'online'
            },
            {
                name: 'Yaachim Nystrom',
                image: 'assets/images/profile3.jpg',
                designation: 'System Admin',
                status: 'offline'
            },
            {
                name: 'Jane McEnroe',
                image: 'assets/images/profile4.jpg',
                designation: 'Supervisor',
                status: 'online'
            }
        ];
    }

    getClients() {
        return [
            {
                name: 'Jake Ebderg',
                image: 'assets/images/client1.jpg',
                email: 'jake.e@gmail.com',
                phoneNumber: '+61254587987',
                status: 'In Meeting',
                class: 'dot dot-red'
            },
            {
                name: 'Rose Wilander',
                image: 'assets/images/client2.jpg',
                email: 'rose.wilander@gmail.com',
                phoneNumber: '+61964887987',
                status: 'Online',
                class: 'dot dot-green'
            },
            {
                name: 'Steve Rogers',
                image: 'assets/images/client3.jpg',
                email: 'steve.rogers@gmail.com',
                phoneNumber: '+61254324587',
                status: 'Commuting',
                class: 'dot dot-orange'
            },
            {
                name: 'Natalie McEnroe',
                image: 'assets/images/client4.jpg',
                email: 'natalie.m@gmail.com',
                phoneNumber: '+61252287987',
                status: 'Online',
                class: 'dot dot-green'
            }
            // ,
            // {
            //   name: 'Peter Miller',
            //   image: 'assets/images/client5.jpg',
            //   email: 'peter.miller@gmail.com',
            //   phoneNumber: '+61548887987'
            // }
        ];
    }

    getEvents() {
        return [
            {
                ActivityDateEnd: startOfToday(),
                ActivityDateStart: endOfTomorrow(),
                ActivityDescription: 'IAM conference in San Francisco',
                ActivityStatus: 'Active',

                ActivityType: 'Appointment',
                _id: '4c02b05d-d974-4190-8c89-ab32cc13ed36'
            },
            {
                ActivityDateEnd: endOfTomorrow(),
                ActivityDateStart: startOfTomorrow(),
                ActivityDescription: 'Meeting with Team for sprint deliverables',
                ActivityStatus: 'Active',
                ActivityTimeEnd: '2019-09-26T10:33:03.495Z',
                ActivityTimeStart: '2019-09-26T10:33:03.070Z',
                ActivityType: 'Appointment',
                _id: '4c02b05d-d974-4190-8c89-ab32cc13ed36'
            }
        ];
    }
    getMoveEvents() {
        return [
            {
                ActivityDateEnd: new Date(),
                ActivityDateStart: new Date(),
                ActivityDescription: 'Submit a survey for the Move',
                ActivityStatus: 'Active',
                ActivityTimeEnd: '2019-09-26T10:33:03.495Z',
                ActivityTimeStart: '2019-09-26T10:33:03.070Z',
                ActivityType: 'Appointment',
                _id: '4c02b05d-d974-4190-8c89-ab32cc13ed36'
            }
        ];
    }
}
