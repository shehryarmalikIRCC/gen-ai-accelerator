import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-landing-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-content.component.html',
  styleUrl: './landing-content.component.css'
})
export class LandingContentComponent implements OnInit {
  cards = [
    {
      id: 1,
      title: 'Retrieve Documents',
      image: 'assets/doc1.jpg',
      visible: false, // Initially hidden for animation
    },
    {
      id: 2,
      title: 'Create Annotated Bibliographies',
      image: 'assets/anno.jfif',
      visible: false, // Initially hidden for animation
    },
    {
      id: 3,
      title: 'Generate Knowledge Scans',
      image: 'assets/ks.jfif',
      visible: false, // Initially hidden for animation
    },
  ];

  ngOnInit() {
    this.revealCards(); // Start animation on component load
  }

  revealCards() {
    this.cards.forEach((card, index) => {
      setTimeout(() => {
        card.visible = true; // Make each card visible after a delay
      }, index * 500); // Delay between each card (500ms)
    });
  }
}