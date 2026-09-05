package com.aportvest.service;

import com.aportvest.dto.CategoriaPlanejamentoDTO;
import com.aportvest.dto.ItemPlanejamentoDTO;
import com.aportvest.dto.PlanejamentoResponseDTO;
import com.aportvest.dto.RendasDTO;
import com.aportvest.exception.RecursoNaoEncontradoException;
import com.aportvest.model.CategoriaPlanejamento;
import com.aportvest.model.ItemPlanejamento;
import com.aportvest.model.Usuario;
import com.aportvest.repository.CategoriaPlanejamentoRepository;
import com.aportvest.repository.ItemPlanejamentoRepository;
import com.aportvest.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanejamentoService {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaPlanejamentoRepository categoriaRepository;
    private final ItemPlanejamentoRepository itemRepository;

    @Transactional(readOnly = true)
    public PlanejamentoResponseDTO obterPlanejamento(Long usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        List<CategoriaPlanejamento> categorias = categoriaRepository.findByUsuarioIdOrderByIdAsc(usuarioId);

        List<CategoriaPlanejamentoDTO> categoriasDTO = categorias.stream().map(cat -> {
            List<ItemPlanejamentoDTO> itensDTO = cat.getItens().stream().map(item ->
                new ItemPlanejamentoDTO(
                    item.getId(),
                    item.getNome(),
                    item.getQuantidade(),
                    item.getValor(),
                    item.getParcelas(),
                    item.getConcluido(),
                    cat.getId()
                )
            ).collect(Collectors.toList());

            return new CategoriaPlanejamentoDTO(cat.getId(), cat.getNome(), cat.getPercent(), itensDTO);
        }).collect(Collectors.toList());

        return new PlanejamentoResponseDTO(
            usuario.getSalario() != null ? usuario.getSalario() : 0.0,
            usuario.getRendaExtra() != null ? usuario.getRendaExtra() : 0.0,
            categoriasDTO
        );
    }

    @Transactional
    public RendasDTO atualizarRendas(Long usuarioId, RendasDTO dto) {
        Usuario usuario = buscarUsuario(usuarioId);
        usuario.setSalario(dto.getSalario() != null ? dto.getSalario() : 0.0);
        usuario.setRendaExtra(dto.getRendaExtra() != null ? dto.getRendaExtra() : 0.0);
        usuarioRepository.save(usuario);
        return new RendasDTO(usuario.getSalario(), usuario.getRendaExtra());
    }

    @Transactional
    public CategoriaPlanejamentoDTO salvarCategoria(Long usuarioId, CategoriaPlanejamentoDTO dto) {
        Usuario usuario = buscarUsuario(usuarioId);
        CategoriaPlanejamento categoria;

        if (dto.getId() != null) {
            categoria = categoriaRepository.findByIdAndUsuarioId(dto.getId(), usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada para este usuário."));
        } else {
            categoria = new CategoriaPlanejamento();
            categoria.setUsuario(usuario);
        }

        categoria.setNome(dto.getNome());
        categoria.setPercent(dto.getPercent());
        CategoriaPlanejamento salva = categoriaRepository.save(categoria);

        List<ItemPlanejamentoDTO> itensDTO = salva.getItens() != null
            ? salva.getItens().stream().map(item -> new ItemPlanejamentoDTO(
                item.getId(), item.getNome(), item.getQuantidade(), item.getValor(), item.getParcelas(), item.getConcluido(), salva.getId()
            )).collect(Collectors.toList())
            : List.of();

        return new CategoriaPlanejamentoDTO(salva.getId(), salva.getNome(), salva.getPercent(), itensDTO);
    }

    @Transactional
    public void excluirCategoria(Long usuarioId, Long categoriaId) {
        CategoriaPlanejamento categoria = categoriaRepository.findByIdAndUsuarioId(categoriaId, usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada para este usuário."));
        categoriaRepository.delete(categoria);
    }

    @Transactional
    public ItemPlanejamentoDTO salvarItem(Long usuarioId, ItemPlanejamentoDTO dto) {
        if (dto.getCategoriaId() == null) {
            throw new IllegalArgumentException("A categoria do item é obrigatória.");
        }

        CategoriaPlanejamento categoria = categoriaRepository.findByIdAndUsuarioId(dto.getCategoriaId(), usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada para este usuário."));

        ItemPlanejamento item;
        if (dto.getId() != null) {
            item = itemRepository.findByIdAndCategoriaUsuarioId(dto.getId(), usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item não encontrado para este usuário."));
        } else {
            item = new ItemPlanejamento();
        }

        item.setCategoria(categoria);
        item.setNome(dto.getNome());
        item.setQuantidade(dto.getQuantidade() != null ? dto.getQuantidade() : 1.0);
        item.setValor(dto.getValor() != null ? dto.getValor() : 0.0);
        item.setParcelas(dto.getParcelas() != null ? dto.getParcelas() : 1);
        if (dto.getConcluido() != null) {
            item.setConcluido(dto.getConcluido());
        } else if (item.getConcluido() == null) {
            item.setConcluido(false);
        }

        ItemPlanejamento salvo = itemRepository.save(item);
        return new ItemPlanejamentoDTO(
            salvo.getId(),
            salvo.getNome(),
            salvo.getQuantidade(),
            salvo.getValor(),
            salvo.getParcelas(),
            salvo.getConcluido(),
            categoria.getId()
        );
    }

    @Transactional
    public ItemPlanejamentoDTO alternarStatusItem(Long usuarioId, Long itemId) {
        ItemPlanejamento item = itemRepository.findByIdAndCategoriaUsuarioId(itemId, usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Item não encontrado para este usuário."));

        item.setConcluido(!Boolean.TRUE.equals(item.getConcluido()));
        ItemPlanejamento salvo = itemRepository.save(item);

        return new ItemPlanejamentoDTO(
            salvo.getId(),
            salvo.getNome(),
            salvo.getQuantidade(),
            salvo.getValor(),
            salvo.getParcelas(),
            salvo.getConcluido(),
            salvo.getCategoria().getId()
        );
    }

    @Transactional
    public void excluirItem(Long usuarioId, Long itemId) {
        ItemPlanejamento item = itemRepository.findByIdAndCategoriaUsuarioId(itemId, usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Item não encontrado para este usuário."));
        itemRepository.delete(item);
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário com ID " + usuarioId + " não encontrado."));
    }
}
