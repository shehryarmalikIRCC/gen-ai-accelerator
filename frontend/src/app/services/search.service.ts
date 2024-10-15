import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { environment } from '../../environments/environment.prod';

interface Document {
  id: string;
  publishedDate: string;
  fileName: string;
  summary: string;
  relevance: string;
  selected?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private embeddingApiUrl = environment.embeddingApiUrl;
  private embeddingApiKey = environment.embeddingApiKey;
  private searchApiUrl = environment.searchApiUrl;
  private searchApiKey = environment.searchApiKey;
  private generateSynthesisApiUrl = environment.generateSynthesisApiUrl;
  private generateSynthesisApiCode = environment.generateSynthesisApiCode;

  constructor(private http: HttpClient) {}

  mapScoreToRelevance(score: number): string {
    if (score > 0.03) {
      return 'Great';
    } else if (score >= 0.02 && score <= 0.03) {
      return 'Good';
    } else {
      return 'Fair';
    }
  }

  // SearchDocument mock API
  searchDocument(query: string): Observable<Document[]> {
    if (!this.embeddingApiUrl) {
      throw new Error("EMBEDDING_API_URL is not defined");
    }
    if (!this.embeddingApiKey) {
      throw new Error("EMBEDDING_API_KEY is not defined");
    }

    const embeddingHeaders = new HttpHeaders({
      "Content-Type": "application/json",
      "api-key": this.embeddingApiKey,
    });

    const embeddingBody = {
      input: query,
    };

    // Call the embedding API
    return this.http
      .post<any>(this.embeddingApiUrl, embeddingBody, {
        headers: embeddingHeaders,
      })
      .pipe(
        switchMap((embeddingResponse) => {
          // Extract the embedding vector from the response
          const embeddingVector = embeddingResponse.data[0].embedding;
          if (!this.searchApiUrl) {
            throw new Error("SEARCH_API_URL is not defined");
          }
          if (!this.searchApiKey) {
            throw new Error("SEARCH_API_KEY is not defined");
          }

          // Set up headers for the search API
          const searchHeaders = new HttpHeaders({
            "Content-Type": "application/json",
            "api-key": this.searchApiKey,
          });

          // Prepare the request body for the search API
          const searchBody = {
            search: query,
            vectorQueries: [
              {
                kind: "vector",
                vector: embeddingVector,
                k: 5,
                fields: "vector",
              },
            ],
            select: "file_name,summary,id",
          };

          // Call the AI Search Endpoint
          return this.http.post<any>(this.searchApiUrl, searchBody, {
            headers: searchHeaders,
          });
        }),
        map((searchResponse) => {
          // Map the search response to an array of Document objects
          const documents: Document[] = searchResponse.value.map(
            (item: any) => ({
              id: item.id,
              publishedDate: "2022-03-11",
              fileName: item.file_name,
              summary: item.summary,
              relevance: this.mapScoreToRelevance(item["@search.score"]),
              selected: false,
            })
          );
          return documents;
        })
      );
  }

  // GenerateSynthesis Mock API
  generateSynthesis(requestBody: any): Observable<any> {
    console.log("API Request Body: ", requestBody);
    if (!this.generateSynthesisApiUrl) {
      throw new Error("GENERATE_API_URL is not defined");
    }
    if (!this.generateSynthesisApiCode) {
      throw new Error("GENERATE_API_KEY is not defined");
    }

    const synthesisHeaders = new HttpHeaders({
      "Content-Type": "application/json",
    });

    const fullUrl = `${this.generateSynthesisApiUrl}?code=${this.generateSynthesisApiCode}`;

    return this.http.post<any>(fullUrl, requestBody, { headers: synthesisHeaders });
  }
}
