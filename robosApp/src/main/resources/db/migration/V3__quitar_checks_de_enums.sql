-- Las bases creadas antes de Flyway (cuando Hibernate armaba las tablas) tienen restricciones CHECK
-- con la lista de valores de cada enum. Cada valor nuevo (por ejemplo la categoría ROBO_COMERCIO)
-- choca contra ellas, así que se quitan: la validación de los enums ya la hace Java.
-- Los nombres los generó MySQL y pueden variar entre bases, por eso se buscan en information_schema.
-- En las bases nuevas no hay ninguna y cada bloque termina ejecutando un "do 0" que no hace nada.

set @sql = (select concat('alter table posteos ', group_concat(concat('drop check `', constraint_name, '`') separator ', '))
	from information_schema.table_constraints
	where constraint_schema = database() and table_name = 'posteos' and constraint_type = 'CHECK');
set @sql = coalesce(@sql, 'do 0');
prepare quitar from @sql;
execute quitar;
deallocate prepare quitar;

set @sql = (select concat('alter table usuarios ', group_concat(concat('drop check `', constraint_name, '`') separator ', '))
	from information_schema.table_constraints
	where constraint_schema = database() and table_name = 'usuarios' and constraint_type = 'CHECK');
set @sql = coalesce(@sql, 'do 0');
prepare quitar from @sql;
execute quitar;
deallocate prepare quitar;

set @sql = (select concat('alter table denuncias ', group_concat(concat('drop check `', constraint_name, '`') separator ', '))
	from information_schema.table_constraints
	where constraint_schema = database() and table_name = 'denuncias' and constraint_type = 'CHECK');
set @sql = coalesce(@sql, 'do 0');
prepare quitar from @sql;
execute quitar;
deallocate prepare quitar;

set @sql = (select concat('alter table confirmaciones ', group_concat(concat('drop check `', constraint_name, '`') separator ', '))
	from information_schema.table_constraints
	where constraint_schema = database() and table_name = 'confirmaciones' and constraint_type = 'CHECK');
set @sql = coalesce(@sql, 'do 0');
prepare quitar from @sql;
execute quitar;
deallocate prepare quitar;

set @sql = (select concat('alter table sugerencias ', group_concat(concat('drop check `', constraint_name, '`') separator ', '))
	from information_schema.table_constraints
	where constraint_schema = database() and table_name = 'sugerencias' and constraint_type = 'CHECK');
set @sql = coalesce(@sql, 'do 0');
prepare quitar from @sql;
execute quitar;
deallocate prepare quitar;
