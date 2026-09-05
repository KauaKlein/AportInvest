package com.aportvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaPlanejamentoDTO {
    private Long id;
    private String nome;
    private Double percent;
    private List<ItemPlanejamentoDTO> itens = new ArrayList<>();
}
