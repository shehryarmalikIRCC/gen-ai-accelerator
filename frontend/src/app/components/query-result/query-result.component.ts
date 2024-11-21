import { Component,Input} from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-query-result',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './query-result.component.html',
  styleUrl: './query-result.component.css'
})
export class QueryResultComponent {

  
  @Input() synthesisResponse!: any;
  @Input() isLoading = true;
}
