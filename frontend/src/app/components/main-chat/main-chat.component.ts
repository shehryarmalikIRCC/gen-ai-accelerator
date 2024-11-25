import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { InputBoxComponent } from '../input-box/input-box.component';
import { UserMessageComponent } from '../user-message/user-message.component';
import { CommonModule } from '@angular/common';
import { QueryResultComponent } from '../query-result/query-result.component';
import { QuerySelectionComponent } from '../query-selection/query-selection.component';
import { LandingContentComponent } from '../landing-content/landing-content.component';
import { SearchqueryService } from '../../services/searchquery.service';
import { Document } from '../../models/document.model';


@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [HeaderComponent, InputBoxComponent,UserMessageComponent,CommonModule,QueryResultComponent, QuerySelectionComponent,LandingContentComponent],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.css'
})
export class MainChatComponent {
  messages: string[] = [];
  isLoading = false;
  showQuerySelection = false;
  showQueryResult = false;
  isHidden = false;
 
  
   // Example documents
  documents: Document[] = [];
  /*
  documents = [
    {
      publishedDate: '2023-09-01',
      fileName: 'Document1.pdf',
      summary: 'Document1 discusses the impact of climate change on coastal ecosystems. It highlights the rapid changes in sea levels and the associated risks to marine biodiversity. Key recommendations for mitigating these impacts are provided.',
      relevance: 'High',
      selected: false
    },
    {
      publishedDate: '2023-09-15',
      fileName: 'Document2.pdf',
      summary: 'Document2 explores advancements in renewable energy technologies. It delves into the benefits of solar and wind energy, emphasizing recent innovations in energy storage. Several case studies demonstrate successful implementation'
  
    }]
  */
  
  
   synthesisResponse: any;
   /* synthesisResponse = {
    general_notes: 'These are the general notes for the query.',
    combined_summaries: [
      {
        pdf_name: 'Document1.pdf',
        bibliography: 'Bibliography1',
        summary: 'Summary1 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
      {
        pdf_name: 'Document2.pdf',
        bibliography: 'Bibliography2',
        summary: 'Summary2 of the document.'
      },
    ],
    overall_summary: 'This is the overall summary of the query results.'
  }; 
*/
   constructor(private searchqueryService: SearchqueryService){}
  

   handleMessageSend(message: string) {
    this.messages.push(message);
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.showQuerySelection = true;
    }, 3000);
    

    // Call the service to search documents
    this.searchqueryService.searchDocument(message).subscribe(
      (docs: Document[]) => {
        this.documents = docs;
        this.isLoading = false;
        this.showQuerySelection = true;
      },
      (error) => {
        console.error('Error fetching documents:', error);
        this.isLoading = false;
      }
    )
    
  }
  handleQuerySelection() {
    console.log("Qtesting")
   
    this.showQuerySelection = false;
    this.isLoading = true;
  
  }

  handleNewKnowledgeScan() {
    
    window.location.reload();
    this.showQueryResult = false;
    this.messages = [];
    this.showQuerySelection = false;
    this.isLoading = false;
    this.synthesisResponse = null
    this.documents =  [];
  }

  handleSynthesisResult(response: any) {
  
    console.log("testing")
    console.log(this.synthesisResponse)
    this.isLoading = false
    this.synthesisResponse = response;
    this.showQuerySelection = false;
    this.showQueryResult = true;

    console.log("testing")
    console.log(this.synthesisResponse)
  }
  
  
}
