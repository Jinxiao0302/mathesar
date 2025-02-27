<script lang="ts">
  import { get } from 'svelte/store';
  import { getTabularDataStoreFromContext } from '@mathesar/stores/table-data/tabularData';

  const MIN_COLUMN_WIDTH = 50;
  const tabularData = getTabularDataStoreFromContext();

  export let columnId: number;

  $: ({ display } = $tabularData);
  $: ({ customizedColumnWidths, columnPlacements } = display);

  let isResizing = false;
  let startingPointerX: number | undefined;
  let startingColumnWidth: number | undefined;

  function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
    return 'touches' in e;
  }

  function getPointerX(e: MouseEvent | TouchEvent) {
    const singularEvent = isTouchEvent(e) ? e.touches[0] : e;
    return singularEvent.clientX;
  }

  function resize(e: MouseEvent | TouchEvent) {
    const pointerMovement = getPointerX(e) - (startingPointerX ?? 0);
    const newColumnWidth = Math.max(
      (startingColumnWidth ?? 0) + pointerMovement,
      MIN_COLUMN_WIDTH,
    );
    customizedColumnWidths.set(columnId, newColumnWidth);
  }

  function getColumnWidth(_columnId: number): number {
    const customizedWidth = customizedColumnWidths.getValue(_columnId);
    if (customizedWidth) {
      return customizedWidth;
    }
    const placement = get(columnPlacements).get(_columnId);
    if (!placement) {
      return 0;
    }
    return placement.width;
  }

  function stopColumnResize() {
    isResizing = false;
    startingPointerX = undefined;
    startingColumnWidth = undefined;
    window.removeEventListener('mousemove', resize, true);
    window.removeEventListener('touchmove', resize, true);
    window.removeEventListener('mouseup', stopColumnResize, true);
    window.removeEventListener('touchend', stopColumnResize, true);
    window.removeEventListener('touchcancel', stopColumnResize, true);
    // TODO persist column width in local storage or via API
  }

  function startColumnResize(e: MouseEvent | TouchEvent) {
    isResizing = true;
    startingColumnWidth = getColumnWidth(columnId);
    startingPointerX = getPointerX(e);
    window.addEventListener('mousemove', resize, true);
    window.addEventListener('touchmove', resize, true);
    window.addEventListener('mouseup', stopColumnResize, true);
    window.addEventListener('touchend', stopColumnResize, true);
    window.addEventListener('touchcancel', stopColumnResize, true);
  }

  function resetColumnWidth() {
    customizedColumnWidths.delete(columnId);
  }
</script>

<div
  class="column-resizer"
  class:is-resizing={isResizing}
  on:mousedown={startColumnResize}
  on:touchstart|nonpassive={startColumnResize}
  on:dblclick={resetColumnWidth}
>
  <div class="indicator" />
</div>

<style>
  .column-resizer {
    --width: 1rem;
    position: absolute;
    width: var(--width);
    height: 100%;
    top: 0;
    right: calc(-1 * var(--width) / 2);
    z-index: 100;
    cursor: e-resize;
    display: flex;
    justify-content: center;
  }
  .indicator {
    position: relative;
    z-index: 100;
    height: 100%;
    width: 0.3rem;
    background: #39a0f5;
  }
  .column-resizer:not(:hover):not(.is-resizing) .indicator {
    display: none;
  }
</style>
