package com.hust.pfma.services;

import com.hust.pfma.dtos.TransactionRequest;
import com.hust.pfma.models.*;
import com.hust.pfma.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy ví tương ứng!"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy danh mục thu chi!"));

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setWallet(wallet);
        transaction.setCategory(category);

        if ("EXPENSE".equalsIgnoreCase(category.getType())) {
            wallet.setBalance(wallet.getBalance() - request.getAmount());
        } else if ("INCOME".equalsIgnoreCase(category.getType())) {
            wallet.setBalance(wallet.getBalance() + request.getAmount());
        }

        walletRepository.save(wallet);
        return transactionRepository.save(transaction);
    }
}