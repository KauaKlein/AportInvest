package com.aportvest.model;

import com.aportvest.model.enums.TipoInvestimento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "aportes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoInvestimento tipo;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorAportado;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorAtual;

    @Column(precision = 8, scale = 4)
    private BigDecimal quantidade;

    @Column(precision = 15, scale = 2)
    private BigDecimal precoUnitario;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataAporte;

    private String corretora;

    private String observacao;

    @Column(precision = 15, scale = 2)
    private BigDecimal precoTeto;

    @Column(precision = 15, scale = 2)
    private BigDecimal precoDesejavel;

    @Column(updatable = false)
    private LocalDateTime criadoEm;

    private LocalDateTime atualizadoEm;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
