import { Component, ElementRef, ViewChild } from "@angular/core";
import { SearchService } from "../../services/search.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

// push document id list, receive document id, query cosmos db

interface Document {
  id: string;
  publishedDate: string;
  fileName: string;
  summary: string;
  relevance: string;
  selected?: boolean;
}

interface Message {
  content: string;
  sender: "user" | "ai";
}

@Component({
  selector: "app-search",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"],
})
export class SearchComponent {
  query: string = "";
  messages: Message[] = [];
  documents: Document[] = [];
  searchPerformed: boolean = false;
  synthesisResponse: any;

  constructor(private searchService: SearchService) {}

  onSend(): void {
    if (this.query.trim() === "") {
      return;
    }

    // Add user's message to messages array
    this.messages.push({ content: this.query, sender: "user" });

    // Call the search service
    this.searchService.searchDocument(this.query).subscribe((docs) => {
      this.documents = docs;
      this.searchPerformed = true;

      // Scroll to the bottom after view has updated
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    });

    // Clear the input field
    this.query = "";
  }

  onGenerateSynthesis(): void {
    const selectedDocumentIds = this.documents
      .filter((doc) => doc.selected)
      .map((doc) => doc.id);

    const requestBody = {
      query: this.messages.find((msg) => msg.sender === "user")?.content || "",
      documents: selectedDocumentIds,
    };

    this.searchService.generateSynthesis(requestBody).subscribe((response) => {
      console.log("Synthesis Response:", response);
      this.synthesisResponse = response;
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    });
  }

  @ViewChild("messagesEnd") private messagesEnd!: ElementRef;

  // Add this method to scroll to the bottom
  private scrollToBottom(): void {
    this.messagesEnd.nativeElement.scrollIntoView({ behavior: "smooth" });
  }

  onNewSearch(): void {
    // Reset the search state
    this.searchPerformed = false;
    this.documents = [];
    this.messages = [];
    this.synthesisResponse = null;

    // Optionally, you can scroll to the top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  getRelevanceClass(relevance: string): string {
    switch (relevance.toLowerCase()) {
      case "great":
        return "relevance-great";
      case "good":
        return "relevance-good";
      case "fair":
        return "relevance-fair";
      default:
        return "";
    }
  }
}
