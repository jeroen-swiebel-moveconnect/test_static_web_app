import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { DataStateChangeEventArgs, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DataSourceChangedEventArgs } from '@syncfusion/ej2-grids';
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
    providedIn: 'root'
})
export class DataService extends Subject<DataStateChangeEventArgs> {
    constructor(private http: HttpClient) {
        super();
    }
    public async execute(data: any) {
        if (data && Array.isArray(data)) {
            for (let index = 0; index < data.length; index++) {
                let record = data[index];
                data[index]['isParent'] = record.children && record.children.length ? true : false;
                data[index]['_id'] = record?.data?._id;
                data[index]['expanded'] = record?.data?.expanded;
            }
            setTimeout(() => {
                let recordsData: any = { result: data, count: data.length };
                super.next(recordsData as DataStateChangeEventArgs);
            }, 100);
        }
    }

    /** DELETE: delete the record from the server */
    deleteRecord(gridData, TreeridInstance: TreeGridComponent): Observable<any> {
        let index = TreeridInstance.dataSource['result'].findIndex((data) => {
            return data.data._id === TreeridInstance.getSelectedRecords()[0]['_id'];
        });
        TreeridInstance.dataSource['result'].splice(index, 1);
        gridData.splice(index, 1);
        return of({ data: TreeridInstance.getSelectedRecords()[0]['_id'] });
    }
}
