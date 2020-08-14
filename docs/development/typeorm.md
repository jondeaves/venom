# TypeORM

The project uses TypeORM to interact with a Postgres database for times when more structured/related data needs to be stored and retrieved.

For full documentation on usage refer to the [TypeORM website](https://typeorm.io/).

## Usage

### Entities

> [Entity](https://typeorm.io/#/entities) is a class that maps to a database table (or collection when using MongoDB). You can create an entity by defining a new class and mark it with @Entity():

### Migrations

In order to ensure databases are up-to-date and in-sync between environments we use the [TypeORM built-in migrations](https://typeorm.io/#/migrations).

This boils down to running the command;

```bash
yarn migrate:generate -n [name_describing_migration_or_feature]
```

This will automatically generate a file in the `src/migrations` folder. From here you run;

```bash
yarn migrate
```

Which will actually make the changes to whatever database is defined in the `src/.env` environment file. This should be automated by the CI but at this time it must be done manually for production. Easiest way for this to happen is to have the production connection url commented out in the environment file so it can be quickly toggled on/off.

### Seeding

The seeding we have implemented is rudamentary but does the trick for now. It is really just a script that triggers TypeORM inserts while being able to truncate/clear data on each run. There is an initial seed file located at `src\seed\characters.ts` as a point of reference.
