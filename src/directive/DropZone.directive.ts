import { Directive, HostListener, EventEmitter, Output, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Output() itemDropped = new EventEmitter<{ id: string, type: string, x: number, y: number }>();

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();

    const data = event.dataTransfer?.getData('text/plain');
    if (!data) return;

    const dropZoneRect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - dropZoneRect.left;
    const y = event.clientY - dropZoneRect.top;

    // Ensure position is within bounds
    const maxX = dropZoneRect.width - 50; // Adjust for item width
    const maxY = dropZoneRect.height - 50; // Adjust for item height

    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));

    const itemData = JSON.parse(data);
    this.itemDropped.emit({
      id: itemData.id,
      type: itemData.type,
      x: clampedX,
      y: clampedY
    });
  }
}
