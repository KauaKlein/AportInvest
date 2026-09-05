package com.aportvest.repository;

import com.aportvest.model.ItemPlanejamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemPlanejamentoRepository extends JpaRepository<ItemPlanejamento, Long> {
    List<ItemPlanejamento> findByCategoriaIdOrderByIdAsc(Long categoriaId);
    Optional<ItemPlanejamento> findByIdAndCategoriaUsuarioId(Long id, Long usuarioId);
}
