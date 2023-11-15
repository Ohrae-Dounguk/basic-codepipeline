import {
    BaseEntity,
    Brackets,
    getConnection,
    ObjectType,
    Repository,
} from "typeorm";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";
import { RootEntity } from "../entities/common/RootEntity";
import { IPage, IPageResult, IPaginatedResult } from "../interface/common/Page";
import { logger } from "../utils/Logger";

export type UnselectRule = {
    [alias: string]: string[];
};

type QueryFunction<Entity> = (
    builder: SelectQueryBuilder<Entity>,
) => SelectQueryBuilder<Entity>;

/**
 * to extend query builder
 */
export class Container<Entity> {
    readonly alias: string;
    private builder: SelectQueryBuilder<Entity>;
    private rules: UnselectRule | null;
    private isSelect: boolean = false;
    private joinUnselects: string[] = [];

    constructor(alias: string, builder: SelectQueryBuilder<Entity>) {
        this.alias = alias;
        this.builder = builder;
    }

    // constructor(alias: string, builder: SelectQueryBuilder<Entity>) {
    //     this.alias = alias;
    //     this.builder = builder;
    // }

    /**
     * add `where` query function isn't necessary for this container,
     * but this is added to execute `where` before work with `join`.
     * because this will reduce handling count of rows.
     * @param params
     */
    public where(
        params: { [key: string]: string | BaseEntity | boolean },
        query: string | undefined = undefined,
    ) {
        if (query) {
            this.builder.where(query, params);
        } else {
            this.builder.where(params);
        }
        return this;
    }

    public multipleWhere(alias: string, field: string, values: string[]) {
        this.builder.andWhere(
            new Brackets((sq) => {
                values.forEach((value) => {
                    sq.orWhere(`${alias}.${field} = ${value}`);
                });
                return sq;
            }),
        );
        return this;
    }

    public join(name: string, condition: string = null): Container<Entity> {
        const splits = name.split(".");
        if (splits.length > 2) return this;
        const isInitial = splits.length == 1;
        const alias = isInitial ? name : splits[1];

        this.builder.leftJoinAndSelect(
            isInitial ? `${this.alias}.${name}` : name,
            alias,
            condition,
        );

        return this;
    }

    public inner_join(
        name: string,
        condition: string = null,
    ): Container<Entity> {
        const splits = name.split(".");
        if (splits.length > 2) return this;
        const isInitial = splits.length == 1;
        const alias = isInitial ? name : splits[1];

        this.builder.innerJoinAndSelect(
            isInitial ? `${this.alias}.${name}` : name,
            alias,
            condition,
        );

        return this;
    }

    public joinUnselect(
        name: string,
        condition: string = null,
    ): Container<Entity> {
        const splits = name.split(".");
        if (splits.length > 2) return this;
        const isInitial = splits.length == 1;
        const alias = isInitial ? name : splits[1];

        this.builder.leftJoin(
            isInitial ? `${this.alias}.${name}` : name,
            alias,
            condition,
        );
        this.joinUnselects.push(alias);

        return this;
    }

    public order(
        order: "ASC" | "DESC",
        sort: string = "created_at",
    ): Container<Entity> {
        const splits = sort.split(".");
        if (splits.length > 2) return this;
        const isInitial = splits.length == 1;
        this.builder.addOrderBy(
            isInitial ? `${this.alias}.${sort}` : sort,
            order,
        );
        return this;
    }

    public unselect(rules: UnselectRule = null): Container<Entity> {
        this.isSelect = false;
        this.rules = rules;
        return this;
    }

    public select(rules: UnselectRule = null): Container<Entity> {
        this.isSelect = true;
        this.rules = rules;
        return this;
    }

    public build(): SelectQueryBuilder<Entity> {
        if (this.rules) {
            const selectors: string[] = [];

            this.builder.expressionMap.aliases.forEach((alias) => {
                if (this.joinUnselects.indexOf(alias.name) >= 0) return;
                const fields = this.rules[alias.name];
                alias.metadata.ownColumns.forEach((value) => {
                    if (!value.relationMetadata) {
                        if (fields) {
                            const index = fields.indexOf(value.propertyName);
                            if (
                                (!this.isSelect && index < 0) ||
                                (this.isSelect && index >= 0)
                            ) {
                                selectors.push(
                                    `${alias.name}.${value.propertyName}`,
                                );
                            }
                        } else {
                            selectors.push(
                                `${alias.name}.${value.propertyName}`,
                            );
                        }
                    }
                });
            });
            this.builder.select(selectors);
        }

        return this.postQuery(this.builder);
    }

    private postQueries: QueryFunction<Entity>[] = [];

    private postQuery(builder: SelectQueryBuilder<Entity>) {
        for (const i in this.postQueries) {
            this.postQueries[i](builder);
        }
        return builder;
    }

    public post(
        postQuery: QueryFunction<Entity> = (builder) => builder,
    ): Container<Entity> {
        this.postQueries.push(postQuery);
        return this;
    }
}

export class CommonRepository<
    Entity extends RootEntity
> extends Repository<Entity> {
    readonly alias: string;
    private readonly entity: ObjectType<Entity>;

    constructor(entity: ObjectType<Entity>) {
        super();
        const metadata = getConnection().getMetadata(entity);
        this.entity = entity;
        this.alias = metadata.tableName;
    }

    protected builder(): Container<Entity> {
        return new Container<Entity>(
            this.alias,
            this.createQueryBuilder(this.alias),
        );
    }

    protected getPageMeta(
        count: number,
        page: number,
        per_page: number,
    ): IPageResult {
        const max_page =
            parseInt(String(count / per_page)) +
            (count % per_page == 0 ? 0 : 1);

        const meta: IPageResult = {
            total: count,
            total_page: max_page,
            per_page: per_page,
            page: page,
        };
        if (page <= 0) {
            page = 1;
        } else if (page > 1 && page >= max_page) {
            page = max_page;
        }
        meta.page = page;
        return meta;
    }

    protected paginated(
        container: Container<Entity>,
        page: IPage,
    ): Promise<IPaginatedResult<Entity>> {
        return new Promise(async (resolve, reject) => {
            const builder = container.build();

            const offset = (page.page - 1) * page.per_page;

            const searchPaged = await builder
                .clone()
                .select(`${this.alias}.*`)
                .groupBy(`${this.alias}.id`)
                .offset(offset)
                .limit(page.per_page)
                .getRawMany();

            const count = await builder.getCount();

            const meta = this.getPageMeta(count, page.page, page.per_page);

            const ids = [];
            for (const i in searchPaged) {
                ids.push(searchPaged[i].id);
            }

            builder
                .andWhereInIds(ids)
                .getMany()
                .then((array) => {
                    if (!array) array = [];
                    else if (!Array.isArray(array)) array = [array];
                    resolve({ array: array, meta: meta });
                })
                .catch((e) => {
                    logger.error(e);
                    reject(e);
                });
        });
    }
}
