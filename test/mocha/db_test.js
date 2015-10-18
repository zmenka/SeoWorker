
describe('DB TEST', function(){
    describe('All', function(){

        it('sql test 4', function(){

            var PgParams = require(".././pg_params");
            return new PgParams().getParamtypes(1)
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql by list', function(){
        //it.only('sql by list', function(){

            var PgExpressions = require("../../server/db/models/pg_expressions");
            var express = PgExpressions;
            var list = [];
            list = list.concat(express.USURLS_WITH_TASKS(1,'TRUE'));

            //list = list.concat(express.GET_AVAILABLE_USERS(1, 1));
            //list = list.concat("SELECT * FROM tt_res_users");
            return express.execute_list(list, false, true)
                .then(function(res){
                    console.log(res);
                });

        })
        //it('sql by list', function(){
        it('sql by list2', function(){

            var model = require("../../server/db/models/pg_spages");
            return model.clearByCondition(1)
                .then(function(res){
                    console.log(res);
                });

        })
        it.only('getNextNotSearched', function(){
        //it.only('sql test 0', function(){

            var PgModel = require("../../server/db/models/pg_condurls");
            return PgModel.getNextNotSearched()
                .then(function(res){
                    console.log(res);
                });

        })
        it('test updater', function(){
            var core = require("../../server/core/core");
            return core.bg()
                .then(function(res){
                    console.log(res);
                });
        })
    })
})
