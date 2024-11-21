import { Component,EventEmitter,Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.css'
})
export class InputBoxComponent {
  inputText: string = '';
  isExpanded: boolean = false;
  isHovered: boolean = false;
  @Output() messageSend = new EventEmitter<string>();

  expandInput() {
    this.isExpanded = true;
  }

  

  shrinkInput() {
    this.isExpanded = false;
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }


  sendMessage() {
    // Logic to send the message goes here
    console.log('Message sent:', this.inputText);
    if (this.inputText.trim()) {
      this.messageSend.emit(this.inputText);
      this.inputText = '';
    
  }}
  
  setHover(status: boolean) {
    this.isHovered = status;
  }


}

