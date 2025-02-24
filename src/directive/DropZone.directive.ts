import { Directive, HostListener, EventEmitter, Output, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Output() itemDropped = new EventEmitter<{ id: string, type: string, x: number, y: number, width: number, height: number }>();

  constructor(private el: ElementRef) { }

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
    let x = (event.clientX - dropZoneRect.left) / dropZoneRect.width * 100;
    let y = (event.clientY - dropZoneRect.top) / dropZoneRect.height * 100;

    // Default size in %
    const width = 10;
    const height = 10;

    const itemData = JSON.parse(data);
    this.itemDropped.emit({
      id: itemData.id,
      type: itemData.type,
      x,
      y,
      width,
      height
    });
  }
}
