var urlAPI = "http://aproveitamento.vps-kinghost.net/";

var navModelo = $("#nav-modelo").clone();
var termoModelo = $("#termoModelo").clone();
var tabModelo = $("#nav-tabContent .tab-pane").clone();
var modeloSimulacoes = $('#tblSimulacoes .modeloSimulacao').clone().removeClass("modeloSimulacao").addClass("itemSimulacao");

tabModelo.find("> row").text("");

var idAluno = null;
var gradesFiltro = null;

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function countProperties(obj) {
    var count = 0;

    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}

function limpaForm() {
    console.log("Salvo");

    $("#cur_nome").text("");

    $("#grades nav .nav").text("");
    $("#grades .tab-content").text("");

    $('form').each(function () { this.reset() });
}

function BuscaInscritos() {
    valida = true;

    var option = $("<option>", { value: 0, text: "Selecione o Aluno..." })
    $("#ddlaluno").html(option)

    if ($("#ddlano").val() == 0) {
        valida = false;
        $("#ddlano").css("border", "1px solid red");
        $("#ddlano").focus();
    } else {
        $("#ddlano").css("border", "");
    }

    if ($("#ddlsemestre").val() == 0) {
        valida = false;
        $("#ddlsemestre").css("border", "1px solid red");
        $("#ddlsemestre").focus();
    } else {
        $("#ddlsemestre").css("border", "");
    }

    if ($("#ddlcurso").val() == 0) {
        valida = false;
        $("#ddlcurso").css("border", "1px solid red");
        $("#ddlcurso").focus();
    } else {
        $("#ddlcurso").css("border", "");
    }

    if (valida) {
        $.ajax({
            type: "GET",
            crossDomain: true,
            url: urlAPI + "/Inscritos/" + $("#ddlano").val() + "/" + $("#ddlsemestre").val() + "/" + $("#ddlcurso").val(),
            contentType: "application/json; charset=utf-8",
            data: "",
            dataType: "json",
            success: function (jsonResult) {
                $(jsonResult).each(function (index, item) {
                    var option = $("<option>", { value: item.pin_codigo, text: item.pes_nome })
                    $("#ddlaluno").append(option)
                });

                if (idAluno != null) {
                    $("#ddlaluno").val(idAluno);
                    BuscarGrade();
                }
            },
            failure: function (response) {
                alert("Erro ao carregar os dados: " + response);
            }
        });
    }
}

function BuscarGrade() {
    var id_curso, ano;
    valida = true;
    id_curso = $("#ddlcurso").val();
    ano = $("#ddlano").val();

    if ($("#ddlcurso").val() == 0) {
        valida = false;
        $("#ddlcurso").css("border", "1px solid red");
        $("#ddlcurso").focus();
    }

    if ($("#ddlano").val() == 0) {
        valida = false;
        $("#ddlano").css("border", "1px solid red");
        $("#ddlano").focus();
    }

    $("#cur_nome").text($("#ddlcurso option:selected").text());

    if (valida) {
        $.ajax({
            type: "GET",
            crossDomain: true,
            url: urlAPI + "/GradeDisciplina/GradeDisciplinaAno/" + id_curso,
            contentType: "application/json; charset=utf-8",
            data: "",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            dataType: "json",
            success: function (jsonResult) {
                $("#termos").text("");
                $("#nav-grades").text("");
                $("#nav-tabContent").text("");

                if (jsonResult) {
                    var grades = groupBy(jsonResult, 'gra_codigo');

                    $.each(grades, function (indexGrade, itemGrade) {
                        var navGrade = navModelo.clone();
                        navGrade.attr("id", "nav-grade" + indexGrade + "-tab");
                        navGrade.attr("href", "#nav-grade" + indexGrade);
                        navGrade.attr("aria-controls", "nav-grade" + indexGrade);
                        navGrade.text("Grade " + indexGrade);

                        var tabGrade = tabModelo.clone();
                        tabGrade.attr("id", "nav-grade" + indexGrade);
                        tabGrade.attr("aria-labelledby", "nav-grade" + indexGrade + "-tab");
                        tabGrade.find("row");

                        var termos = groupBy(itemGrade, 'grd_termo');

                        $.each(termos, function (indexTermo, itemTermo) {
                            var termo = termoModelo.clone();
                            termo.removeAttr("id");
                            var linhaModelo = $("#linhamodelo").clone();

                            termo.find("#itens").text("");
                            termo.find(".numTermo").text(indexTermo);

                            itemTermo.sort(function (a, b) {
                                if (a.dis_codigo > b.dis_codigo) {
                                    return 1;
                                }
                                if (a.dis_codigo < b.dis_codigo) {
                                    return -1;
                                }
                                return 0;
                            });

                            $.each(itemTermo, function (index, item) {
                                var linha = linhaModelo.clone().removeAttr("id");
                                $(linha).find('.disCodigo').attr("id", item.grd_codigo);
                                $(linha).find('.nomeDisciplina').text(item.dis_nome);
                                $(linha).find('.cargaHoraria').text(item.dis_ch);

                                if (gradesFiltro != null) {
                                    var result = $.grep(gradesFiltro, function (e) {
                                        return e.grd_codigo == item.grd_codigo;
                                    });

                                    if (result.length > 0) {
                                        $(linha).find('.justificativa').val(result[0].aprovdis_justificativa);
                                        $(linha).find('.disCodigo').prop('checked', true);
                                    } else {
                                        $(linha).find('.disCodigo').prop('checked', false);
                                        $(linha).find('.justificativa').val('');
                                    }
                                }

                                termo.find("#itens").append(linha);

                            });
                            tabGrade.find(".row").append(termo);
                        });

                        $("#nav-grades").append(navGrade);
                        $("#nav-tabContent").append(tabGrade);
                    });

                    $('#grades .nav-tabs a:first').tab('show');
                    if (gradesFiltro != null) {
                        var item = gradesFiltro[0].gra_codigo;
                        $('#grades .nav-tabs #nav-grade' + item + '-tab').tab('show');

                        $('#grades .nav-tabs :not(#nav-grade' + item + '-tab)').remove();

                        var form = $("#nav-grade" + item).find("form")

                        form.prepend($("<input>").attr("type", "hidden").attr("name", "cod_simulacao").attr("value", gradesFiltro[0].simu_codigo));
                        form.find("#btnSalvar").attr("id", "btnEditar").text("Editar");
                        form.find("#btnAprovar").attr("data-simulacao", gradesFiltro[0].simu_codigo);
                        form.find("#btnNegar").attr("data-simulacao", gradesFiltro[0].simu_codigo);
                        $("#botaoStatus").show();
                    }
                }

            },
            failure: function (response) {
                alert("Erro ao carregar os dados: " + response);
            }
        });
    } else {
        /*Swal.fire(
            'Erro',
            'Não Foi possivel buscar!',
            'error'
        )*/
    }
}

function mostraSimulacao(simulacoes, numSimulacao) {
    console.log(simulacoes);
    console.log(simulacoes[numSimulacao]);
    console.log(simulacoes[numSimulacao][0]);



    $('form').each(function () { this.reset() });
    var itensSelect = simulacoes[numSimulacao][0];

    $("#ddlano").val(itensSelect.ves_anoingresso);
    $("#ddlsemestre").val(itensSelect.ves_semestreingresso);
    $("#ddlcurso").val(itensSelect.cur_codigo);

    idAluno = itensSelect.pin_codigo;

    gradesFiltro = simulacoes[numSimulacao];

    $("#ddlcurso").trigger('change');

    $("html, body").animate({ scrollTop: 0 }, "slow");
}

$(document).ready(function () {
    $("#ddlano").on("change", function () {
        BuscaInscritos();
    });

    $("#ddlsemestre").on("change", function () {
        BuscaInscritos();
    });

    $("#ddlcurso").on("change", function () {
        BuscaInscritos();
    });

    $('#txtBusca').select2();

    var $drpBusca = $('#txtBusca');

    $drpBusca.select2({
        placeholder: "Nome do aluno",
        theme: "bootstrap",
        width: "100%",
        minimumInputLength: 3,
        maximumSelectionSize: 1,
        multiple: true,
        language: "pt-BR",
        // options coming from the select2 documentation
        // you can ignore it
        ajax: {
            url: urlAPI + "/Inscritos/BuscaInscrito",
            dataType: 'json',
            delay: 500,
            data: function (params) {
                var query = {
                    nome: params.term
                }

                // Query parameters will be ?search=[term]&type=public
                return query;
            },
            processResults: function (data) {
                data.results = $.map(data.results, function (obj) {
                    //console.log(obj);
                    var inscrito = $("<span>").text(obj.pes_nome);

                    obj.id = obj.pin_codigo;
                    obj.text = inscrito.text();

                    return obj;
                });

                return data;
            }
            // Additional AJAX parameters go here; see the end of this chapter for the full code of this example
        },
        formatResult: function (data) {
            //console.log(data);
            if (!data.pin_codigo) return data.text; // optgroup
            return data.nome;
        },
        formatSelection: function (data) {
            console.log(data);
            if (!data.pin_codigo) return data.text; // optgroup
            return data.nome;
        },
        templateSelection: function (selection) {
            console.log(selection);
            var inscrito = $("<span>").text(selection.pes_nome);

            return inscrito.text();
        },
        //dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
        escapeMarkup: function (m) {
            return m;
        } // we do not want to escape markup since we are displaying html in results
    });

    $drpBusca.on('select2:select', function (e) {
        console.log(e.params.data);
        $.ajax({
            type: "GET",
            crossDomain: true,
            url: urlAPI + "/HistoricoTransfNome/GetInscrito/" + e.params.data.pin_codigo,
            contentType: "application/json; charset=utf-8",
            success: function (jsonResult) {
                if (typeof jsonResult == 'string') {
                    alert(jsonResult);
                }

                if (jsonResult == null || jsonResult.length == 0) {
                    alert("Nenhum aluno encontrado!");
                    return;
                }

                var simulacoes = groupBy(jsonResult, 'simu_codigo');

                var quantidadeSimulacoes = countProperties(simulacoes);

                if (quantidadeSimulacoes == 1) {
                    mostraSimulacao(simulacoes, jsonResult[0].simu_codigo);
                } else {
                    $('#tblSimulacoes tbody').text('');

                    for (var prop in simulacoes) {
                        var item = modeloSimulacoes.clone();
                        item.data("codSimulacao", prop);
                        item.attr("data-codSimulacao", prop);

                        var dataSimulacao = new Date(simulacoes[prop][0].simu_data);

                        var dia = dataSimulacao.getDate();
                        var mes = dataSimulacao.getMonth() + 1;
                        var ano = dataSimulacao.getFullYear();

                        var hora = dataSimulacao.getHours();
                        var minutos = dataSimulacao.getMinutes();
                        var segundos = dataSimulacao.getSeconds();

                        if (dia < 10) {
                            dia = '0' + dia;
                        }

                        if (mes < 10) {
                            mes = '0' + mes;
                        }

                        if (hora < 10) {
                            hora = '0' + hora;
                        }

                        if (minutos < 10) {
                            minutos = '0' + minutos;
                        }

                        if (segundos < 10) {
                            segundos = '0' + segundos;
                        }

                        item.find('.codSimulacao').text(prop);
                        item.find('.dataHoraSimulacao').text(dia + "/" + mes + "/" + ano + " " + hora + ":" + minutos + ":" + segundos);
                        item.find('.statusSimulacao').addClass("status-" + simulacoes[prop][0].hisStatus_codigo).text(simulacoes[prop][0].hisStatus_descricao);

                        $('#modalSimulacoes').find('.nomeAluno').text(simulacoes[prop][0].pes_nome);

                        item.on("click", function (e) {
                            e.preventDefault();

                            mostraSimulacao(simulacoes, $(this).attr("data-codSimulacao"));

                            $('#modalSimulacoes').modal('hide');
                            $('body').removeClass('modal-open');
                            $().trigger('click');
                        });

                        $('#tblSimulacoes tbody').append(item);
                    }

                    $('#modalSimulacoes').modal('show');
                }

                $('#modalBusca').modal('hide');
                $('body').removeClass('modal-open');
                $('#modalBusca').trigger('click');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                alert("Erro ao carregar os dados: " + errorThrown);
            }
        });
    });

    $.ajax({
        type: "GET",
        crossDomain: true,
        url: urlAPI + "/AcaCursos/Ativos",
        contentType: "application/json; charset=utf-8",
        data: "",
        dataType: "json",
        success: function (jsonResult) {
            $(jsonResult).each(function (index, item) {
                var option = $("<option>", { value: item.cur_codigo, text: item.cur_nome });
                $("#ddlcurso").append(option)
            })
        },
        failure: function (response) {
            alert("Erro ao carregar os dados: " + response);
        }
    });

    $("#frmbusca").on("submit", function (e) {
        e.preventDefault();

        idAluno = null;
        gradesFiltro = null;

        BuscarGrade();
    });

    $(document).on("click", "#btnBuscar", function (e) {
        e.preventDefault();

        idAluno = null;
        gradesFiltro = null;
    });

    $(document).on("click", "#btnAprovar", function (e) {
        e.preventDefault();

        $.ajax({
            type: "PUT",
            crossDomain: true,
            url: urlAPI + "/HistoricoTransf/AprovarSimulacao/" + $(this).attr("data-simulacao"),
            contentType: "application/json; charset=utf-8",
            success: function (jsonResult) {
                alert(jsonResult);
            },
            complete: function (e) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                alert("Erro ao carregar os dados: " + errorThrown);
            }
        });
    });

    $(document).on("click", "#btnNegar", function (e) {
        e.preventDefault();

        $.ajax({
            type: "PUT",
            crossDomain: true,
            url: urlAPI + "/HistoricoTransf/NegarSimulacao/" + $(this).attr("data-simulacao"),
            contentType: "application/json; charset=utf-8",
            success: function (jsonResult) {
                alert(jsonResult);
            },
            complete: function (e) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                alert("Erro ao carregar os dados: " + errorThrown);
            }
        });
    });

    $(document).on("click", "#btnSalvar", function (e) {
        e.preventDefault();

        var $this = $(this).closest(".grade_form");
        var disciplinas = {};

        $this.find(".disCodigo:checked").each(function (index) {
            disciplinas[$(this).attr("id")] = $(this).closest("tr").find(".justificativa").val();
            //disciplinas.push({ "Key": $(this).attr("id"), "Value": $(this).closest("tr").find(".justificativa").val() });
        });

        console.log(JSON.stringify(disciplinas));

        $.ajax({
            type: "PUT",
            crossDomain: true,
            url: urlAPI + "/HistoricoTransf/Simulacao/" + $("#ddlaluno").val(),
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(disciplinas),
            success: function (jsonResult) {
                limpaForm();
                alert(jsonResult);
            },
            complete: function (e) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                alert("Erro ao carregar os dados: " + errorThrown);
            }
        });
    });

    $(document).on("click", "#btnEditar", function (e) {
        e.preventDefault();

        var $this = $(this).closest(".grade_form");
        var disciplinas = {};

        $this.find(".disCodigo:checked").each(function (index) {
            disciplinas[$(this).attr("id")] = $(this).closest("tr").find(".justificativa").val();
            //disciplinas.push({ "Key": $(this).attr("id"), "Value": $(this).closest("tr").find(".justificativa").val() });
        });

        var codSimulacao = $this.find('input[name="cod_simulacao"]').val();

        $.ajax({
            type: "POST",
            crossDomain: true,
            url: urlAPI + "/HistoricoTransf/Simulacao/" + codSimulacao,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(disciplinas),
            success: function (jsonResult) {
                alert(jsonResult);
                limpaForm();
            },
            complete: function (e) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                alert("Erro ao carregar os dados: " + errorThrown);
            }
        });
    });

    $(document).on("click", "#btnCancelar", function (e) {
        limpaForm();
    });
});