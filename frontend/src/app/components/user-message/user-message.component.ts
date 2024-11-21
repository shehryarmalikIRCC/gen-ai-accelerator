import { Component,Input, } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-message.component.html',
  styleUrl: './user-message.component.css'
})
export class UserMessageComponent {

  @Input() message: string = "";
}

