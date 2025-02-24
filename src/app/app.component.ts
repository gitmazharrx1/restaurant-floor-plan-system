import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DraggableDirective } from '../directive/Draggable.directive';
import { DropZoneDirective } from '../directive/DropZone.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DraggableDirective, DropZoneDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  layout: any[] = [];
  isResizing = false;
  resizeIndex = -1;
  startX = 0;
  startY = 0;
  startWidth = 0;
  startHeight = 0;

  ngOnInit() {
    this.loadLayout();
  }

  dragStart(event: DragEvent, type: string) {
    event.dataTransfer?.setData('text/plain', JSON.stringify({ id: this.generateId(), type }));
  }

  onItemDropped(event: any) {
    this.layout.push(event);
  }

  updateItemPosition(index: number, event: { x: number; y: number }) {
    if (this.layout[index]) {
      this.layout[index].x = event.x;
      this.layout[index].y = event.y;
    }
  }

  deleteItem(index: number) {
    this.layout.splice(index, 1);
  }

  saveLayout() {
    localStorage.setItem('restaurantLayout', JSON.stringify(this.layout));
    alert('Layout Saved!');
  }

  loadLayout() {
    const savedLayout = localStorage.getItem('restaurantLayout');
    if (savedLayout) {
      this.layout = JSON.parse(savedLayout);
    }
  }

  clearLayout() {
    this.layout = [];
    localStorage.removeItem('restaurantLayout');
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /** START RESIZING **/
  startResizing(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeIndex = index;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.layout[index].width;
    this.startHeight = this.layout[index].height;

    document.addEventListener('mousemove', this.resizeElement);
    document.addEventListener('mouseup', this.stopResizing);
  }

  resizeElement = (event: MouseEvent) => {
    if (!this.isResizing) return;

    const dropZone = document.querySelector('.drop-zone') as HTMLElement;
    const dropZoneRect = dropZone.getBoundingClientRect();

    const dx = ((event.clientX - this.startX) / dropZoneRect.width) * 100;
    const dy = ((event.clientY - this.startY) / dropZoneRect.height) * 100;

    let newWidth = Math.max(5, this.startWidth + dx);
    let newHeight = Math.max(5, this.startHeight + dy);

    // Ensure resizing stays inside drop zone
    newWidth = Math.min(newWidth, 100 - this.layout[this.resizeIndex].x);
    newHeight = Math.min(newHeight, 100 - this.layout[this.resizeIndex].y);

    this.layout[this.resizeIndex].width = newWidth;
    this.layout[this.resizeIndex].height = newHeight;
  };

  stopResizing = () => {
    this.isResizing = false;
    this.resizeIndex = -1;
    document.removeEventListener('mousemove', this.resizeElement);
    document.removeEventListener('mouseup', this.stopResizing);
  };
}
