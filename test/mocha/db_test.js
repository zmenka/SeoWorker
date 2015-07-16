
describe('DB TEST', function(){
    describe('All', function(){

        it.only('sql test 1', function(){

            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            return express.execute_list(express.USERS_URL_COUNT())
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql test 2', function(){

            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            console.log(express.USERS_URL_COUNT());
        })
    })
})
