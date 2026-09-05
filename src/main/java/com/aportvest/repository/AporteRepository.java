package com.aportvest.repository;

import com.aportvest.model.Aporte;
import com.aportvest.model.enums.TipoInvestimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AporteRepository extends JpaRepository<Aporte, Long> {

    List<Aporte> findByTipo(TipoInvestimento tipo);

    List<Aporte> findByCorretora(String corretora);

    List<Aporte> findByDataAporteBetween(LocalDate inicio, LocalDate fim);

    List<Aporte> findByNomeContainingIgnoreCase(String nome);

    List<Aporte> findByUsuarioId(Long usuarioId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.valorAportado) FROM Aporte a")
    java.math.BigDecimal sumValorAportado();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.valorAtual) FROM Aporte a")
    java.math.BigDecimal sumValorAtual();
}
