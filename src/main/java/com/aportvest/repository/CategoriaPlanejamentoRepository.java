package com.aportvest.repository;

import com.aportvest.model.CategoriaPlanejamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaPlanejamentoRepository extends JpaRepository<CategoriaPlanejamento, Long> {
    List<CategoriaPlanejamento> findByUsuarioIdOrderByIdAsc(Long usuarioId);
    Optional<CategoriaPlanejamento> findByIdAndUsuarioId(Long id, Long usuarioId);
}
