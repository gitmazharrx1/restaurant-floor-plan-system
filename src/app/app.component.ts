import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
  connections: { tableId: string, chairId: string }[] = [];
  selectedTableId: string | null = null;
  tableLabelCount: number = 1;
  chairLabelCount: number = 1;

  // Resizing related properties
  isResizing = false;
  resizeIndex = -1;
  startX = 0;
  startY = 0;
  startWidth = 0;
  startHeight = 0;

  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

  ngOnInit() {
    this.loadLayout();
  }

  // Handles dragging start for tables and chairs
  dragStart(event: DragEvent, type: string) {
    let label = type === 'table' ? `Table ${this.tableLabelCount++}` : `Chair ${this.chairLabelCount++}`;
    event.dataTransfer?.setData('text/plain', JSON.stringify({ id: this.generateId(), type, label }));
  }

  // Handles item deletion and removes related connections
  deleteItem(index: number, item: any) {
    this.layout.splice(index, 1);
    if (item.type === 'table') {
      this.connections = this.connections.filter(c => c.tableId !== item.id);
    } else if (item.type === 'chair') {
      this.connections = this.connections.filter(c => c.chairId !== item.id);
    }
    this.updateConnections();
  }

  // Saves layout and connections to local storage
  saveLayout() {
    localStorage.setItem('restaurantLayout', JSON.stringify({ layout: this.layout, connections: this.connections }));
    alert('Layout and Connections Saved!');
  }

  // Loads saved layout from local storage
  loadLayout() {
    const savedData = localStorage.getItem('restaurantLayout');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.layout = parsedData.layout || [];
      this.connections = parsedData.connections || [];
      this.tableLabelCount = this.layout.filter(item => item.type === 'table').length + 1;
      this.chairLabelCount = this.layout.filter(item => item.type === 'chair').length + 1;
      setTimeout(() => this.updateConnections(), 100);
    }
  }

  // Clears layout and local storage data
  clearLayout() {
    this.layout = [];
    localStorage.removeItem('restaurantLayout');
    this.updateConnections()
  }

  // Generates a unique ID for each item
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

  // Handles item drop event
  onItemDropped(event: any) {
    this.layout.push(event);
    this.updateConnections();
  }

  // Updates item position on drag
  updateItemPosition(index: number, event: { x: number; y: number }) {
    if (this.layout[index]) {
      this.layout[index].x = event.x;
      this.layout[index].y = event.y;
      this.updateConnections();
    }
  }

  // Selects a table to connect chairs
  selectTable(tableId: string) {
    this.selectedTableId = tableId;
  }

  // Connects a chair to the selected table
  connectChairToTable(chairId: string) {
    if (this.selectedTableId) {
      this.connections = this.connections.filter(c => c.chairId !== chairId);
      this.connections.push({ tableId: this.selectedTableId, chairId });
      this.updateConnections();
    } else {
      alert('Please select a table first.');
    }
  }

  // Updates visual connection lines between tables and chairs
  // Updates visual connection lines between tables and chairs
  updateConnections() {
    if (!this.svgContainer) return;
    const svg = this.svgContainer.nativeElement;
    svg.innerHTML = ''; // Clear previous connections

    const dropZone = document.querySelector('.drop-zone') as HTMLElement;
    if (!dropZone) return;
    const dropZoneRect = dropZone.getBoundingClientRect(); // Get drop-zone dimensions

    this.connections.forEach(({ tableId, chairId }) => {
      const table = this.layout.find(item => item.id === tableId);
      const chair = this.layout.find(item => item.id === chairId);

      if (table && chair) {
        // Convert percentages to actual pixel values
        const tableX = (table.x / 100) * dropZoneRect.width;
        const tableY = (table.y / 100) * dropZoneRect.height;
        const tableWidth = (table.width / 100) * dropZoneRect.width;
        const tableHeight = (table.height / 100) * dropZoneRect.height;

        const chairX = (chair.x / 100) * dropZoneRect.width;
        const chairY = (chair.y / 100) * dropZoneRect.height;
        const chairWidth = (chair.width / 100) * dropZoneRect.width;
        const chairHeight = (chair.height / 100) * dropZoneRect.height;

        let startX = 0, startY = 0, endX = 0, endY = 0;

        // Determine relative position of the chair to the table
        const isLeft = chairX + chairWidth <= tableX;      // Chair is fully to the left
        const isRight = chairX >= tableX + tableWidth;     // Chair is fully to the right
        const isAbove = chairY + chairHeight <= tableY;    // Chair is above the table
        const isBelow = chairY >= tableY + tableHeight;    // Chair is below the table

        if (isLeft) {
          // Chair is to the left → Connect from table's left-center to chair's right-center
          startX = tableX;
          startY = tableY + tableHeight / 2;
          endX = chairX + chairWidth;
          endY = chairY + chairHeight / 2;
        }
        else if (isRight) {
          // Chair is to the right → Connect from table's right-center to chair's left-center
          startX = tableX + tableWidth;
          startY = tableY + tableHeight / 2;
          endX = chairX;
          endY = chairY + chairHeight / 2;
        }
        else if (isAbove) {
          // Chair is above → Connect from table's top-center to chair's bottom-center
          startX = tableX + tableWidth / 2;
          startY = tableY;
          endX = chairX + chairWidth / 2;
          endY = chairY + chairHeight;
        }
        else if (isBelow) {
          // Chair is below → Connect from table's bottom-center to chair's top-center
          startX = tableX + tableWidth / 2;
          startY = tableY + tableHeight;
          endX = chairX + chairWidth / 2;
          endY = chairY;
        }

        // Create an SVG path for the connection
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2}, ${endX} ${endY}`);
        path.setAttribute('stroke', 'black'); // Line color
        path.setAttribute('fill', 'transparent'); // No fill
        path.setAttribute('stroke-width', '2'); // Line thickness

        // Append path to the SVG container
        svg.appendChild(path);
      }
    });
  }




}
