package com.aportvest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "itens_planejamento")
public class ItemPlanejamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull
    private String nome;

    @Column(nullable = false)
    private Double quantidade = 1.0;

    @Column(nullable = false)
    @NotNull
    private Double valor;

    @Column(nullable = false)
    private Integer parcelas = 1;

    @Column(nullable = false)
    private Boolean concluido = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    @JsonIgnore
    private CategoriaPlanejamento categoria;
}
