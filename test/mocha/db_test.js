
describe('DB TEST', function(){
    describe('All', function(){

        it('sql test 4', function(){

            var PgParams = require("../../server/db/postgres/pg_params");
            return new PgParams().getParamtypes(1)
                .then(function(res){
                    console.log(res);
                });

        })
        //it('sql by list', function(){
        it.only('sql by list', function(){
            
            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            var list = []
            list = list.concat(express.USERS_URL_COUNT(10));

            //list = list.concat(express.GET_AVAILABLE_USERS(1, 1));
            //list = list.concat("SELECT * FROM tt_res_users");
            return express.execute_list(list, false, true)
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql test 0', function(){
        //it.only('sql test 0', function(){

            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            return express.execute_list(express.GET_SITE_PARAM(2,1,9))
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql test 0', function(){
        //it.only('sql test insert positions', function(){

            var PgPositions = require("../../server/db/postgres/pg_positions");
            var pg_positions = new PgPositions()
            return pg_positions.insert('test.com','7','1')
                .then(function(res){
                    console.log(res);
                });

        })
    })
})
