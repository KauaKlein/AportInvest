package com.aportvest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "historicos_mensais")
public class HistoricoMensal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @Column(nullable = false, length = 10)
    @NotNull
    private String mesAno; // ex: "2026-09"

    @Column(nullable = false, length = 50)
    @NotNull
    private String nomeMes; // ex: "Setembro / 2026"

    private Double salario;

    private Double rendaExtra;

    private Double rendaTotal;

    private Double totalPlanejado;

    private Double totalExecutado;

    private Double saldoRestante;

    private Integer totalItens;

    private Integer itensConcluidos;

    @Column(columnDefinition = "TEXT")
    private String detalhesJson;

    private LocalDateTime dataFechamento = LocalDateTime.now();
}
