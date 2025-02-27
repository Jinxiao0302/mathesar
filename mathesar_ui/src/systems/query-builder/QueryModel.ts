import type {
  QueryInstanceInitialColumn,
  QueryInstanceTransformation,
} from '@mathesar/api/queries/queryList';
import type { UnsavedQueryInstance } from '@mathesar/stores/queries';
import QueryFilterTransformationModel from './QueryFilterTransformationModel';
import QuerySummarizationTransformationModel from './QuerySummarizationTransformationModel';

export interface QueryModelUpdateDiff {
  model: QueryModel;
  type:
    | 'id'
    | 'name'
    | 'baseTable'
    | 'initialColumnsArray'
    | 'initialColumnName'
    | 'transformations';
  diff: Partial<UnsavedQueryInstance>;
}

export type QueryTransformationModel =
  | QueryFilterTransformationModel
  | QuerySummarizationTransformationModel;

function getTransformationModel(
  transformation: QueryInstanceTransformation,
): QueryTransformationModel {
  if (transformation.type === 'filter') {
    return new QueryFilterTransformationModel(transformation);
  }
  return new QuerySummarizationTransformationModel(transformation);
}

export default class QueryModel {
  base_table: UnsavedQueryInstance['base_table'];

  id: UnsavedQueryInstance['id'];

  name: UnsavedQueryInstance['name'];

  initial_columns: QueryInstanceInitialColumn[];

  transformationModels: QueryTransformationModel[];

  constructor(model?: UnsavedQueryInstance | QueryModel) {
    this.base_table = model?.base_table;
    this.id = model?.id;
    this.name = model?.name;
    this.initial_columns = model?.initial_columns ?? [];
    if (model && 'transformationModels' in model) {
      this.transformationModels = [...model.transformationModels];
    } else {
      this.transformationModels =
        model?.transformations?.map(getTransformationModel) ?? [];
    }
  }

  withBaseTable(base_table?: number): QueryModelUpdateDiff {
    const model = new QueryModel({
      base_table,
      id: this.id,
      name: this.name,
    });
    return {
      model,
      type: 'baseTable',
      diff: {
        base_table,
      },
    };
  }

  withId(id: number): QueryModelUpdateDiff {
    const model = new QueryModel({
      ...this,
      id,
    });
    return {
      model,
      type: 'id',
      diff: {
        id,
      },
    };
  }

  withName(name: string): QueryModelUpdateDiff {
    const model = new QueryModel({
      ...this,
      name,
    });
    return {
      model,
      type: 'name',
      diff: {
        name,
      },
    };
  }

  withColumn(column: QueryInstanceInitialColumn): QueryModelUpdateDiff {
    const initialColumns = [...this.initial_columns, column];
    const model = new QueryModel({
      ...this,
      initial_columns: initialColumns,
    });
    return {
      model,
      type: 'initialColumnsArray',
      diff: {
        initial_columns: initialColumns,
      },
    };
  }

  withoutColumn(columnAlias: string): QueryModelUpdateDiff {
    const initialColumns = this.initial_columns.filter(
      (entry) => entry.alias !== columnAlias,
    );
    const model = new QueryModel({
      ...this,
      initial_columns: initialColumns,
    });
    return {
      model,
      type: 'initialColumnsArray',
      diff: {
        initial_columns: initialColumns,
      },
    };
  }

  withDisplayNameForColumn(
    columnAlias: string,
    displayName: string,
  ): QueryModelUpdateDiff {
    const initialColumns = this.initial_columns.map((entry) => {
      if (entry.alias === columnAlias) {
        return {
          ...entry,
          display_name: displayName,
        };
      }
      return entry;
    });
    const model = new QueryModel({
      ...this,
      initial_columns: initialColumns,
    });
    return {
      model,
      type: 'initialColumnName',
      diff: {
        initial_columns: initialColumns,
      },
    };
  }

  withTransformations(
    transformations?: QueryInstanceTransformation[],
  ): QueryModelUpdateDiff {
    const model = new QueryModel({
      ...this,
      transformations,
    });
    return {
      model,
      type: 'transformations',
      diff: {
        transformations,
      },
    };
  }

  withTransformationModels(
    transformationModels?: QueryTransformationModel[],
  ): QueryModelUpdateDiff {
    const model = new QueryModel({
      ...this,
      transformationModels,
    });
    return {
      model,
      type: 'transformations',
      diff: {
        transformations: model.toJSON().transformations,
      },
    };
  }

  getColumn(columnAlias: string): QueryInstanceInitialColumn | undefined {
    return this.initial_columns.find((column) => column.alias === columnAlias);
  }

  toJSON(): UnsavedQueryInstance {
    return {
      id: this.id,
      name: this.name,
      base_table: this.base_table,
      initial_columns: this.initial_columns,
      transformations: this.transformationModels?.map((entry) =>
        entry.toJSON(),
      ),
    };
  }
}
