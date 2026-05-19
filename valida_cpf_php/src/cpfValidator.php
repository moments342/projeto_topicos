<?php

function validarCPF($cpf) {
    // Remove caracteres não numéricos
    $cpf = preg_replace('/[^0-9]/', '', $cpf);

    // Verifica se tem 11 dígitos ou se são todos números iguais
    if (strlen($cpf) != 11 || preg_match('/^(\d)\1+$/', $cpf)) {
        return false;
    }

    // Valida o primeiro dígito verificador
    $soma = 0;
    for ($i = 1; $i <= 9; $i++) {
        $soma += intval(substr($cpf, $i - 1, 1)) * (11 - $i);
    }
    $resto = ($soma * 10) % 11;
    if ($resto == 10 || $resto == 11) {
        $resto = 0;
    }
    if ($resto != intval(substr($cpf, 9, 1))) {
        return false;
    }

    // Valida o segundo dígito verificador
    $soma = 0;
    for ($i = 1; $i <= 10; $i++) {
        $soma += intval(substr($cpf, $i - 1, 1)) * (12 - $i);
    }
    $resto = ($soma * 10) % 11;
    if ($resto == 10 || $resto == 11) {
        $resto = 0;
    }
    if ($resto != intval(substr($cpf, 10, 1))) {
        return false;
    }

    return true;
}