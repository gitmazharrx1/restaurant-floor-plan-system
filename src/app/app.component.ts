import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DraggableDirective } from '../directive/Draggable.directive';  // ✅ Import correctly
import { DropZoneDirective } from '../directive/DropZone.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DraggableDirective, DropZoneDirective],  // ✅ Ensure directives are imported
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  layout: any[] = [];

  ngOnInit() {
    this.loadLayout();
  }

  dragStart(event: DragEvent, type: string) {
    event.dataTransfer?.setData('text/plain', JSON.stringify({ id: this.generateId(), type }));
  }

  onItemDropped(event: any) {
    this.layout.push(event);
    this.saveLayout();
  }

  updateItemPosition(updatedItem: any, index: number) {
    this.layout[index].x = updatedItem.x;
    this.layout[index].y = updatedItem.y;
    this.saveLayout();
  }


  deleteItem(index: number) {
    this.layout.splice(index, 1);
    this.saveLayout();
  }

  saveLayout() {
    localStorage.setItem('restaurantLayout', JSON.stringify(this.layout));
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
