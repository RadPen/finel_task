"use client"

import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import deployedContracts from '../contracts/deployedContracts';

const contractAddress = deployedContracts["31337"].YourContract.address;
const contractAPI = deployedContracts["31337"].YourContract.abi;

export default function Home() {
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState("");
    const [delegateAddress, setDelegateAddress] = useState("");
    const [newProposal, setNewProposal] = useState("");
    const [hasVoted, setHasVoted] = useState(false);
    const [voteMessage, setVoteMessage] = useState("");
    const [isVotingEnded, setIsVotingEnded] = useState(false);
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

    const fetchData = async () => {
        const contract = new ethers.Contract(contractAddress, contractAPI, provider);
        const proposalCount = await contract.getProposalCount();
        const loadedProposals = [];

        for (let i = 0; i < proposalCount; i++) {
            const proposal = await contract.proposals(i);
            loadedProposals.push(proposal);
        }

        const voter = await contract.voters(provider.getSigner().getAddress());
        setHasVoted(voter.voted);
        setProposals(loadedProposals);
        const votingEnded = await contract.votingEnded();
        setIsVotingEnded(votingEnded);
    };

    useEffect(() => {
        fetchData();
    }, [provider]);

    const handleVote = async () => {
        if (hasVoted) {
            setVoteMessage("Вы уже проголосовали.");
            return;
        }

        try {
            const signer = provider.getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractAPI, signer);
            await (await contractWithSigner.vote(selectedProposal)).wait();
            setVoteMessage("Ваш голос успешно учтен!");
            setHasVoted(true);
            fetchData();
        } catch (error) {
            setVoteMessage("Ошибка: " + error.message);
        }
    };

    const handlePropose = async () => {
        if (!newProposal) {
            setVoteMessage("Пожалуйста, введите текст нового предложения.");
            return;
        }

        try {
            const signer = provider.getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractAPI, signer);
            await (await contractWithSigner.propose(ethers.utils.formatBytes32String(newProposal))).wait();
            setVoteMessage("Предложение успешно добавлено!");
            setNewProposal("");
            fetchData();
        } catch (error) {
            setVoteMessage("Ошибка: " + error.message);
        }
    };

    const handleDelegate = async () => {
        if (!delegateAddress) {
            setVoteMessage("Пожалуйста, введите адрес для делегирования.");
            return;
        }

        try {
            const signer = provider.getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractAPI, signer);
            await (await contractWithSigner.delegate(delegateAddress)).wait();
            setVoteMessage("Ваш голос успешно делегирован!");
            setDelegateAddress("");
            fetchData();
        } catch (error) {
            setVoteMessage("Ошибка: " + error.message);
        }
    };

    const handleRevokeVote = async () => {
        try {
            const signer = provider.getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractAPI, signer);
            await (await contractWithSigner.revokeVote()).wait();
            setVoteMessage("Ваш голос успешно отозван!");
            setHasVoted(false);
            fetchData();

        } catch (error) {
            setVoteMessage("Ошибка: " + error.message);
        }
    };

    const handleResetVoting = async () => {
        try {
            const signer = provider.getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractAPI, signer);
            await (await contractWithSigner.resetVoting()).wait();
            setVoteMessage("Голосование успешно сброшено!");
            fetchData();
        } catch (error) {
            setVoteMessage("Ошибка: " + error.message);
        }
    };

    const handleEndVoting = async () => {
        try {
            const signer = provider.getSigner();
            const contractWithSigner = new ethers.Contract(contractAddress, contractAPI, signer);
            await (await contractWithSigner.endVoting()).wait();
            setVoteMessage("Голосование успешно завершено!");
            setIsVotingEnded(true);
            fetchData();
        } catch (error) {
            setVoteMessage("Ошибка: " + error.message);
        }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f7f9fc', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Голосование</h1>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', padding: '20px', width: '80%', maxWidth: '500px', textAlign: 'center' }}>
                <h3>Выберите предложение для голосования</h3>
                <select value={selectedProposal} onChange={(e) => setSelectedProposal(e.target.value)} disabled={hasVoted || isVotingEnded} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <option value="">-- Выберите предложение --</option>
                    {proposals.map((proposal, index) => (
                        <option key={index} value={index}>
                            {ethers.utils.toUtf8String(proposal.name)} - Голоса: {proposal.voteCount.toString()}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleVote}
                    disabled={hasVoted || !selectedProposal || isVotingEnded}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px 20px', margin: '10px 0', fontSize: '1rem', transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Проголосовать
                </button>
                <h3>Добавить новое предложение</h3>
                <input
                    type="text"
                    value={newProposal}
                    onChange={(e) => setNewProposal(e.target.value)}
                    placeholder="Введите текст нового предложения"
                    disabled={hasVoted || isVotingEnded}
                    style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}
                />
                <button
                    onClick={handlePropose}
                    disabled={hasVoted || isVotingEnded}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px 20px', margin: '10px 0', fontSize: '1rem', transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Добавить предложение
                </button>
                <input
                    type="text"
                    value={delegateAddress}

                    onChange={(e) => setDelegateAddress(e.target.value)}
                    placeholder="Введите адрес для делегирования"
                    disabled={hasVoted || isVotingEnded}
                    style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}
                />
                <button
                    onClick={handleDelegate}
                    disabled={hasVoted || isVotingEnded}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px 20px', margin: '10px 0', fontSize: '1rem', transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Делегировать голос
                </button>
                <button
                    onClick={handleRevokeVote}
                    disabled={!hasVoted || isVotingEnded}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px 20px', margin: '10px 0', fontSize: '1rem', transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Отозвать голос
                </button>
                <button
                    onClick={handleResetVoting}
                    disabled={!isVotingEnded}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px 20px', margin: '10px 0', fontSize: '1rem', transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Сбросить голосование
                </button>
                <button
                    onClick={handleEndVoting}
                    disabled={!isVotingEnded}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px 20px', margin: '10px 0', fontSize: '1rem', transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    Завершить голосование
                </button>
                {voteMessage && <p style={{ marginTop: '10px', color: voteMessage.includes("Ошибка") ? 'red' : 'green' }}>{voteMessage}</p>}
                {hasVoted && <p>Вы уже проголосовали. Спасибо за участие!</p>}
            </div>
        </div>
    );
}
