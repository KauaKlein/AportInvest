package com.aportvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanejamentoResponseDTO {
    private Double salario;
    private Double rendaExtra;
    private List<CategoriaPlanejamentoDTO> categorias = new ArrayList<>();
}
