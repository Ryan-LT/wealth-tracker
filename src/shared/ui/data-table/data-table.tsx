"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { useIsMobile } from "@/shared/lib/use-media-query";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Applied to both header and body cells. */
    className?: string;
    align?: "left" | "right";
  }
}

type ReorderConfig = {
  /** When false the handles are shown disabled with `disabledReason`. */
  enabled: boolean;
  disabledReason?: string;
  onReorder: (activeId: string, overId: string) => void;
};

export type DataTableProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Controlled sorting; omit to let the table manage it. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** Data is already sorted by the caller (keeps domain tie-breaks). */
  manualSorting?: boolean;
  /** Below `md`, render each row with this instead of a table row. */
  renderMobileItem?: (row: T) => ReactNode;
  /** Shown when `data` is empty. */
  empty: ReactNode;
  reorder?: ReorderConfig;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
};

type DragHandleContextValue = {
  attributes?: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
  setActivatorNodeRef?: (el: HTMLElement | null) => void;
  disabled: boolean;
  disabledReason?: string;
};

const DragHandleContext = createContext<DragHandleContextValue>({ disabled: true });

function DragHandle({ label }: { label: string }) {
  const { attributes, listeners, setActivatorNodeRef, disabled, disabledReason } = useContext(DragHandleContext);
  const button = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      disabled={disabled}
      aria-label={`Drag to reorder ${label}`}
      className="inline-flex size-6 touch-none items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 enabled:cursor-grab enabled:active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </button>
  );
  if (!disabled || !disabledReason) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{button}</span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  );
}

function SortableTableRow({
  id,
  disabled,
  disabledReason,
  className,
  onClick,
  children,
}: {
  id: string;
  disabled: boolean;
  disabledReason?: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  return (
    <DragHandleContext.Provider value={{ attributes, listeners, setActivatorNodeRef, disabled, disabledReason }}>
      <TableRow
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        className={cn(isDragging && "relative z-10 bg-card shadow-md", className)}
      >
        {children}
      </TableRow>
    </DragHandleContext.Provider>
  );
}

/** Table on desktop, stacked items on phones. Filtering is done by the caller. */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  sorting: sortingProp,
  onSortingChange,
  manualSorting,
  renderMobileItem,
  empty,
  reorder,
  onRowClick,
  rowClassName,
  className,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = sortingProp ?? internalSorting;

  const allColumns = useMemo<ColumnDef<T>[]>(() => {
    if (!reorder) return columns;
    return [
      {
        id: "__drag",
        header: () => <span className="sr-only">Reorder</span>,
        cell: ({ row }) => <DragHandle label={getRowId(row.original)} />,
        enableSorting: false,
        meta: { className: "w-8 !pr-0" },
      },
      ...columns,
    ];
  }, [columns, reorder, getRowId]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting },
    onSortingChange: onSortingChange ?? setInternalSorting,
    getRowId: (row) => getRowId(row),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    manualSorting,
    sortDescFirst: false,
    enableSortingRemoval: true,
  });

  const rows = table.getRowModel().rows;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (data.length === 0) return <div className={className}>{empty}</div>;

  if (isMobile && renderMobileItem) {
    return (
      <ul className={cn("divide-y", className)}>
        {rows.map((row) => (
          <li key={row.id}>{renderMobileItem(row.original)}</li>
        ))}
      </ul>
    );
  }

  const hasFooter = table.getFooterGroups().some((g) => g.headers.some((h) => h.column.columnDef.footer));

  const renderCells = (row: Row<T>) =>
    row.getVisibleCells().map((cell) => (
      <TableCell
        key={cell.id}
        className={cn(
          cell.column.columnDef.meta?.align === "right" && "text-right",
          cell.column.columnDef.meta?.className,
        )}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    ));

  const body = (
    <TableBody>
      {rows.map((row) =>
        reorder ? (
          <SortableTableRow
            key={row.id}
            id={row.id}
            disabled={!reorder.enabled}
            disabledReason={reorder.disabledReason}
            className={cn(onRowClick && "cursor-pointer", rowClassName?.(row.original))}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          >
            {renderCells(row)}
          </SortableTableRow>
        ) : (
          <TableRow
            key={row.id}
            className={cn(onRowClick && "cursor-pointer", rowClassName?.(row.original))}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          >
            {renderCells(row)}
          </TableRow>
        ),
      )}
    </TableBody>
  );

  const tableEl = (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="hover:bg-transparent">
            {group.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              return (
                <TableHead
                  key={header.id}
                  aria-sort={
                    header.column.getCanSort()
                      ? sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                  className={cn(
                    header.column.columnDef.meta?.align === "right" && "text-right",
                    header.column.columnDef.meta?.className,
                  )}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      {reorder ? (
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {body}
        </SortableContext>
      ) : (
        body
      )}
      {hasFooter ? (
        <TableFooter>
          {table.getFooterGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableCell
                  key={header.id}
                  className={cn(
                    header.column.columnDef.meta?.align === "right" && "text-right",
                    header.column.columnDef.meta?.className,
                  )}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableFooter>
      ) : null}
    </Table>
  );

  if (!reorder) return tableEl;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={(event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        reorder.onReorder(String(active.id), String(over.id));
      }}
    >
      {tableEl}
    </DndContext>
  );
}
