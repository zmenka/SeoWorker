
describe('DB TEST', function(){
    describe('All', function(){

        it('sql test 4', function(){

            var PgParams = require("../../server/db/postgres/pg_params");
            return new PgParams().getParamtypes(1)
                .then(function(res){
                    console.log(res);
                });

        })
        it.only('sql by list', function(){
            
            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            var list = []
            list = list.concat(express.USERS_URL_COUNT(1))
            return express.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql test 0', function(){

            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            return express.execute_list(express.USERS_URL_COUNT())
                .then(function(res){
                    console.log(res);
                });

        })
    })
})
