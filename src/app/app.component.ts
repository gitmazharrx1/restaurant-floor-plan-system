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
  isResizing = false;
  resizeIndex = -1;
  startX = 0;
  startY = 0;
  startWidth = 0;
  startHeight = 0;
  tableLabelCount: number = 1;
  chairLabelCount: number = 1;
  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;
  connections: { tableId: string, chairId: string }[] = [];
  selectedTableId: string | null = null;

  ngOnInit() {
    this.loadLayout();
  }

  dragStart(event: DragEvent, type: string) {
    let label = ''
    if (type == 'table') {
      label = `Table ${this.tableLabelCount}`
      this.tableLabelCount++;
    } else if (type == 'chair') {
      label = `Chair ${this.chairLabelCount}`
      this.chairLabelCount++;
    }
    event.dataTransfer?.setData('text/plain', JSON.stringify({ id: this.generateId(), type, label }));
  }



  deleteItem(index: number, item: any) {
    this.layout.splice(index, 1);
    if (item.type == 'table') {
      let tables = this.connections.find(c => c.tableId == item.id);
      if (tables) {
        this.connections = this.connections.filter(c => c.tableId != tables.tableId);
      }
    } else if (item.type == 'chair') {
      let chair = this.connections.findIndex(c => c.chairId == item.id);
      if (chair !== -1) {
        this.connections.splice(chair, 1);
      }
    }
    this.updateConnections();
  }

  saveLayout() {
    const layoutData = {
      layout: this.layout,
      connections: this.connections
    };
    localStorage.setItem('restaurantLayout', JSON.stringify(layoutData));
    alert('Layout and Connections Saved!');
  }


  loadLayout() {
    const savedData = localStorage.getItem('restaurantLayout');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.layout = parsedData.layout || [];
      this.connections = parsedData.connections || [];

      // Update counts to avoid label duplication
      this.tableLabelCount = this.layout.filter(item => item.type === 'table').length + 1;
      this.chairLabelCount = this.layout.filter(item => item.type === 'chair').length + 1;

      // Ensure connections are updated after the view initializes
      setTimeout(() => {
        this.updateConnections();
      }, 100);
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

  onItemDropped(event: any) {
    this.layout.push(event);
    this.updateConnections();
  }

  updateItemPosition(index: number, event: { x: number; y: number }) {
    if (this.layout[index]) {
      this.layout[index].x = event.x;
      this.layout[index].y = event.y;
      this.updateConnections();
    }
  }

  selectTable(tableId: string) {
    this.selectedTableId = tableId;
  }

  connectChairToTable(chairId: string) {
    if (this.selectedTableId) {
      let index = this.connections.findIndex(c => c.chairId === chairId)
      if (index !== -1) {
        this.connections.splice(index, 1);
      }

      this.connections.push({ tableId: this.selectedTableId, chairId });
      this.updateConnections();
    } else {
      alert('Please select a table first.');
    }
  }

  updateConnections() {
    if (!this.svgContainer) return;
    const svg = this.svgContainer.nativeElement;
    svg.innerHTML = '';

    const dropZone = document.querySelector('.drop-zone') as HTMLElement;
    if (!dropZone) return;

    const dropZoneRect = dropZone.getBoundingClientRect();

    this.connections.forEach(({ tableId, chairId }) => {
      const table = this.layout.find(item => item.id === tableId);
      const chair = this.layout.find(item => item.id === chairId);

      if (table && chair) {
        // Convert percentage positions to pixels
        const tableX = (table.x / 100) * dropZoneRect.width;
        const tableY = (table.y / 100) * dropZoneRect.height;
        const chairX = (chair.x / 100) * dropZoneRect.width;
        const chairY = (chair.y / 100) * dropZoneRect.height;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M${tableX} ${tableY} Q ${(tableX + chairX) / 2} ${(tableY + chairY) / 2}, ${chairX} ${chairY}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'black');
        path.setAttribute('fill', 'transparent');
        path.setAttribute('stroke-width', '2');
        svg.appendChild(path);
      }
    });
  }
}
