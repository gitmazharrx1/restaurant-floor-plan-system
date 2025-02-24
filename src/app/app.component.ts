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

  ngOnInit() {
    this.loadLayout();
  }

  dragStart(event: DragEvent, type: string) {
    event.dataTransfer?.setData('text/plain', JSON.stringify({ id: this.generateId(), type }));
  }

  onItemDropped(event: any) {
    this.layout.push(event);
  }

  updateItemPosition(event: { index: number, x: number, y: number }) {
    this.layout[event.index].x = event.x;
    this.layout[event.index].y = event.y;
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
}
