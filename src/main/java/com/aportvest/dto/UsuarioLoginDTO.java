package com.aportvest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioLoginDTO {

    @NotBlank
    private String login;

    @NotBlank
    private String senha;
}
