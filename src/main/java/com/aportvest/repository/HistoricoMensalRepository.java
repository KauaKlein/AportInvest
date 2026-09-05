package com.aportvest.repository;

import com.aportvest.model.HistoricoMensal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricoMensalRepository extends JpaRepository<HistoricoMensal, Long> {
    List<HistoricoMensal> findByUsuarioIdOrderByMesAnoDesc(Long usuarioId);
    Optional<HistoricoMensal> findByUsuarioIdAndMesAno(Long usuarioId, String mesAno);
}
