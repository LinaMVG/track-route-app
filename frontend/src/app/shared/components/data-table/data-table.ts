import {
  Component, Input, Output, EventEmitter,
  ContentChildren, QueryList, TemplateRef,
  Directive, signal,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  cellClass?: (row: T) => string;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Directive({ selector: '[appCellTemplate]', standalone: true })
export class CellTemplateDirective {
  @Input('appCellTemplate') column!: string;
  constructor(public readonly template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T extends Record<string, unknown>> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() nextCursor: string | null = null;
  @Input() hasPrev = false;
  @Input() trackBy: keyof T = 'id' as keyof T;
  @Input() showActions = false;
  @Input() actionsTemplate!: TemplateRef<unknown>;
  @Input() emptyMessage = 'No se encontraron registros';

  @Output() nextPage  = new EventEmitter<string>();
  @Output() prevPage  = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<SortEvent>();

  @ContentChildren(CellTemplateDirective)
  cellTemplates!: QueryList<CellTemplateDirective>;

  protected readonly skeletonRows = Array(5).fill(0);
  protected readonly currentSort  = signal<SortEvent | null>(null);

  protected onSort(column: string): void {
    const current   = this.currentSort();
    const direction = current?.column === column && current.direction === 'asc' ? 'desc' : 'asc';
    this.currentSort.set({ column, direction });
    this.sortChange.emit({ column, direction });
  }

  protected getSortIcon(column: string): string {
    const sort = this.currentSort();
    if (!sort || sort.column !== column) return '⇅';
    return sort.direction === 'asc' ? '↑' : '↓';
  }

  protected getCell(row: T, key: string): unknown {
    return key.split('.').reduce((obj: unknown, k) => {
      return obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined;
    }, row);
  }

  protected getCellTemplate(column: string): TemplateRef<unknown> | null {
    return this.cellTemplates?.find((t) => t.column === column)?.template ?? null;
  }

  protected trackByFn(row: T): unknown {
    return row[this.trackBy];
  }
}
