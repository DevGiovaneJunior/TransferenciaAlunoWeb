var urlAPI = "https://localhost:5001";

$.ajax({
    type: "GET",
    url: urlAPI + "/AcaCursos/Ativos",
    contentType: "application/json; charset=utf-8",
    data: "",
    dataType: "json",
    success: function (jsonResult) {
        console.log(jsonResult);
            $(jsonResult).each(function (index, item) {
                var option = $("<option>", { value: item.cur_codigo, text: item.cur_nome })
                $("#ddlcurso").append(option)
            })
    },
    failure: function (response) {
        alert("Erro ao carregar os dados: " + response);
    }
});

function BuscarMatriz() {
    var id_curso;
    valida = true;
    id_curso = $("#dllcurso").val();
    if ($("#dllcurso").val() == 0) {

        valida = false;
        $("#dllcurso").css("border", "1px solid red");
        $("#dllcurso").focus();
    }

    if (valida) {
        $("#itens").empty();

        $.ajax({
            type: "POST",
            url: urlAPI + "/AcaCursos/" + id_curso,
            contentType: "application/json; charset=utf-8",
            data: "",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            dataType: "json",
            success: function (jsonResult) {
                if (jsonResult.status) {

                    $(jsonResult.resultado).each(function (index, item) {
                        var linha = $("#linhamodelo").clone();
                        $(linha).find('.codigo').text(item.id);
                        $(linha).find('.nome').text(item.usu_nome);
                        $(linha).find('.cpf').text(item.usu_cpf);
                        $(linha).find('.telefone').text(item.usu_telefone);
                        $(linha).find('.email').text(item.usu_email);
                        $(linha).find('.senha').text(item.usu_senha);
                        $(linha).find('.cate').text(item.admid);


                        $("#itens").append(linha);

                    })
                }

            },
            failure: function (response) {
                alert("Erro ao carregar os dados: " + response);
            }
        });
    } else {
        Swal.fire(
            'Erro',
            'Não Foi possivel buscar!',
            'error'
        )
    }
}