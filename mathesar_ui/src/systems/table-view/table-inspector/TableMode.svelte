<script>
  import { Collapsible } from '@mathesar-component-library';
  import TableConstraints from '@mathesar/systems/table-view/constraints/TableConstraints.svelte';
  import RenameTableProperty from './RenameTableProperty.svelte';
  import ConstraintHelp from '../constraints/__help__/ConstraintHelp.svelte';
</script>

<div class="table-mode-container">
  <Collapsible isOpen>
    <span slot="header">Table Properties</span>
    <div slot="content" class="property-container">
      <RenameTableProperty />
    </div>
  </Collapsible>

  <Collapsible isOpen>
    <span slot="header">Links <ConstraintHelp /></span>
    <div slot="content" class="property-container">
      <TableConstraints />
    </div>
  </Collapsible>
</div>

<style>
  .table-mode-container {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .property-container {
    padding: 1rem;
  }
</style>
