import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Observable,throwError } from "rxjs";
import { switchMap, map,tap,catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GenerateSynthesisService {

  constructor(private http: HttpClient) { }
  
  
  generateSynthesis(requestBody: any): Observable<any> {
    console.log("API Request Body:", requestBody);
    return this.http.post<any>('/api/generate-synthesis', requestBody).pipe(
      tap((response) => {
        console.log("Received synthesis response:", response);
      })
    );
  }
}
