package com.aportvest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemPlanejamentoDTO {
    private Long id;
    private String nome;
    private Double quantidade;
    private Double valor;
    private Integer parcelas;
    private Boolean concluido;
    private Long categoriaId;
}
