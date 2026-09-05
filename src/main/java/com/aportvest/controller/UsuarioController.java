package com.aportvest.controller;


import com.aportvest.dto.UsuarioCadastroDTO;
import com.aportvest.dto.UsuarioLoginDTO;
import com.aportvest.model.Usuario;
import com.aportvest.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // cadastra um usuario
    @PostMapping("/cadastro")
    public ResponseEntity<Usuario> cadastrar(@RequestBody @Valid UsuarioCadastroDTO dto) {


        // 1. Chama o metodo cadastrar da variável service, passando a variável dto
        Usuario novoUsuario = service.cadastrar(dto);
            novoUsuario.setSenha(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);

    }

    //
    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody @Valid UsuarioLoginDTO dto) {
            Usuario logarUsuario = service.logar(dto);
            logarUsuario.setSenha(null);
            return ResponseEntity.ok(logarUsuario);
    }
}
