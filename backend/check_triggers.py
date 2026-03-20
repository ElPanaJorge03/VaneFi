import psycopg2

conn = psycopg2.connect('dbname=vanefi user=postgres password=1234 host=localhost')
c = conn.cursor()
c.execute("SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'expenses';")
print(c.fetchall())
