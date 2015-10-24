
for f in fn_*.sql
do
    echo 'Накатываем '$f
    su postgres -c "psql -f $f"
done