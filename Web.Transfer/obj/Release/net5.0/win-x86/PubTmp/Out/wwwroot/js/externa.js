var urlAPI = "https://localhost:44304";

var navModelo = $("#nav-modelo").clone();
var termoModelo = $("#termoModelo").clone();
var tabModelo = $("#nav-tabContent .tab-pane").clone();
tabModelo.find("> row").text("");

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

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
                })
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

                                termo.find("#itens").append(linha);

                            });
                            tabGrade.find(".row").append(termo);
                        });

                        $("#nav-grades").append(navGrade);
                        $("#nav-tabContent").append(tabGrade);
                    });

                    $('#grades .nav-tabs a:first').tab('show');
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

    $.ajax({
        type: "GET",
        crossDomain: true,
        url: urlAPI + "/AcaCursos/Ativos",
        contentType: "application/json; charset=utf-8",
        data: "",
        dataType: "json",
        success: function (jsonResult) {
            $(jsonResult).each(function (index, item) {
                var option = $("<option>", { value: item.cur_codigo, text: item.cur_nome })
                $("#ddlcurso").append(option)
            })
        },
        failure: function (response) {
            alert("Erro ao carregar os dados: " + response);
        }
    });

    $("#frmbusca").on("submit", function (e) {
        e.preventDefault();
        BuscarGrade();
    });

    $(document).on("click", "#btnBuscar", function (e) {
        e.preventDefault();

        $.ajax({
            type: "GET",
            crossDomain: true,
            url: urlAPI + "/HistoricoTransfNome/" + $("#txtBusca").val(),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (jsonResult) {
                //console.log(jsonResult);
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
});