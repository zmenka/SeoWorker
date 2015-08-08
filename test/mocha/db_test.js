
describe('DB TEST', function(){
    describe('All', function(){

        it('sql test 4', function(){

            var PgParams = require("../../server/db/postgres/pg_params");
            return new PgParams().getParamtypes(1)
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql by list', function(){
        //it.only('sql by list', function(){
            
            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            var list = []
            list.push('DROP TABLE IF EXISTS tt_lst_urls;');
            list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS    ' +
                      'SELECT + ' + 2 + ' AS CONDITION_ID, ' +
                                       1 + ' AS URL_ID;' );
            list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID,CONDITION_ID);');
            list = list.concat(express.GET_PERCENT_BY_URL());
    
            list = list.concat('SELECT * FROM tt_res_hpercents');
            //list = list.concat('SELECT * FROM tt_res_hpercents WHERE paramtype_id = 1');
            //list = list.concat(express.GET_PARAMTYPES_BY_SEARCH(1,1))
            return express.execute_list(list)
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
        //it('sql test 0', function(){
        it.only('sql test insert positions', function(){

            var PgPositions = require("../../server/db/postgres/pg_positions");
            var pg_positions = new PgPositions()
            return pg_positions.insert('test.com','7','1')
                .then(function(res){
                    console.log(res);
                });

        })
    })
})
