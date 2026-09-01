package com.aportvest.service;

import com.aportvest.exception.RecursoNaoEncontradoException;
import com.aportvest.model.Aporte;
import com.aportvest.model.enums.TipoInvestimento;
import com.aportvest.repository.AporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AporteService {

    private final AporteRepository aporteRepository;

    public List<Aporte> listarTodos() {
        return aporteRepository.findAll();
    }

    public Aporte buscarPorId(Long id) {
        return aporteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aporte não encontrado com id: " + id));
    }

    public List<Aporte> buscarPorTipo(TipoInvestimento tipo) {
        return aporteRepository.findByTipo(tipo);
    }

    public List<Aporte> buscarPorCorretora(String corretora) {
        return aporteRepository.findByCorretora(corretora);
    }

    public List<Aporte> buscarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return aporteRepository.findByDataAporteBetween(inicio, fim);
    }

    public List<Aporte> buscarPorNome(String nome) {
        return aporteRepository.findByNomeContainingIgnoreCase(nome);
    }

    public Aporte salvar(Aporte aporte) {
        return aporteRepository.save(aporte);
    }

    public Aporte atualizar(Long id, Aporte aporteAtualizado) {
        Aporte existente = buscarPorId(id);

        existente.setNome(aporteAtualizado.getNome());
        existente.setTipo(aporteAtualizado.getTipo());
        existente.setValorAportado(aporteAtualizado.getValorAportado());
        existente.setValorAtual(aporteAtualizado.getValorAtual());
        existente.setQuantidade(aporteAtualizado.getQuantidade());
        existente.setPrecoUnitario(aporteAtualizado.getPrecoUnitario());
        existente.setDataAporte(aporteAtualizado.getDataAporte());
        existente.setCorretora(aporteAtualizado.getCorretora());
        existente.setObservacao(aporteAtualizado.getObservacao());
        existente.setPrecoTeto(aporteAtualizado.getPrecoTeto());
        existente.setPrecoDesejavel(aporteAtualizado.getPrecoDesejavel());

        return aporteRepository.save(existente);
    }

    public void deletar(Long id) {
        Aporte aporte = buscarPorId(id);
        aporteRepository.delete(aporte);
    }
}
