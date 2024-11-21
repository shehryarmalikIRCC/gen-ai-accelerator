import { Component,Input,Output,EventEmitter,ViewChild,ElementRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenerateSynthesisService } from '../../services/generate-synthesis.service';

@Component({
  selector: 'app-query-selection',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './query-selection.component.html',
  styleUrl: './query-selection.component.css'
})
export class QuerySelectionComponent {
  @Input() query: string = "";
  @Input() documents: any[] = [];
  @Output() synthesisResult = new EventEmitter<any>();
  @Output() querySelection = new EventEmitter<boolean>();
  @ViewChild('topElement') topElement!: ElementRef;

  constructor(private synthesisService:GenerateSynthesisService){}
  getRelevanceClass(relevance: string): string {
    switch (relevance) {
      case 'Great':
        return 'relevance-high';
      case 'Good':
        return 'relevance-medium';
      case 'Fair':
      default:
        return 'relevance-low';
    }
  }
  
  handleQueryComponent(){
    this.querySelection.emit()
  }

  handleGenerateButton(){
    this.handleQueryComponent()
    setTimeout(() => {
      this.generateSynthesis()
    
    }, 500);
  }

  handleBackButton(){
    window.location.reload();
  }
  cleanFileName(fileName: string): string {
    return fileName.replace(/.*intermediate\/(.*)\.pdf_chunk_.*(_pages_\d+_to_\d+\.pdf)/, '$1$2').replace('_', '.');
  }

  generateSynthesis() {
    this.topElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    
    const selectedDocumentIds = this.documents.filter(doc => doc.selected).map(doc => doc.id);
    const requestBody = {
      query: this.query,
      documents: selectedDocumentIds
    };
    
    this.synthesisService.generateSynthesis(requestBody).subscribe(
      (response) => {
        console.log("Emitting Response")
        console.log(response)
        this.synthesisResult.emit(response);

      
      },
      (error) => {
        console.error('Error generating synthesis:', error);
      }
    );
  }
}