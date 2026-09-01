package com.aportvest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ManipuladorExcecoes {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> manipularRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        Map<String, Object> resposta = new HashMap<>();
        resposta.put("dataHora", LocalDateTime.now());
        resposta.put("status", HttpStatus.NOT_FOUND.value());
        resposta.put("erro", "Recurso não encontrado");
        resposta.put("mensagem", ex.getMessage());
        return resposta;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> manipularExcecoesValidacao(MethodArgumentNotValidException ex) {
        Map<String, Object> resposta = new HashMap<>();
        resposta.put("dataHora", LocalDateTime.now());
        resposta.put("status", HttpStatus.BAD_REQUEST.value());
        resposta.put("erro", "Erro de Validação");
        
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((erro) -> {
            String nomeCampo = ((FieldError) erro).getField();
            String mensagemErro = erro.getDefaultMessage();
            erros.put(nomeCampo, mensagemErro);
        });
        resposta.put("mensagem", erros);
        
        return resposta;
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> manipularTodasExcecoes(Exception ex) {
        Map<String, Object> resposta = new HashMap<>();
        resposta.put("dataHora", LocalDateTime.now());
        resposta.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        resposta.put("erro", "Erro Interno do Servidor");
        resposta.put("mensagem", ex.getMessage());
        return resposta;
    }
}
